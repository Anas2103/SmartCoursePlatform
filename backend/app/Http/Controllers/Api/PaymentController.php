<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;
use Stripe\Exception\SignatureVerificationException;

class PaymentController extends Controller
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function checkout(Request $request): JsonResponse
    {
        $request->validate(['course_id' => 'required|exists:courses,id']);

        $course = Course::findOrFail($request->course_id);
        $user = auth()->user();

        // Check if already enrolled
        if ($user->enrollments()->where('course_id', $course->id)->exists()) {
            return response()->json(['message' => 'Already enrolled in this course.'], 422);
        }

        $price = $course->effective_price;

        // Free course — enroll directly
        if ($price <= 0) {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'amount_paid' => 0,
            ]);

            $course->increment('total_enrolled');

            return response()->json(['message' => 'Enrolled successfully.', 'enrollment' => $enrollment]);
        }

        // Demo mode: no real Stripe key configured -> simulate a successful payment
        if (!$this->stripeConfigured()) {
            $payment = Payment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'amount' => $price,
                'currency' => 'USD',
                'status' => 'completed',
                'payment_method' => 'demo',
                'metadata' => ['demo' => true],
            ]);

            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'payment_id' => $payment->id,
                'amount_paid' => $price,
            ]);

            $course->increment('total_enrolled');

            return response()->json([
                'message' => 'Enrolled successfully (demo payment).',
                'enrollment' => $enrollment,
                'payment' => $payment,
            ]);
        }

        // Create Stripe Payment Intent
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => intval($price * 100),
            'currency' => 'usd',
            'metadata' => [
                'course_id' => $course->id,
                'user_id' => $user->id,
            ],
        ]);

        $payment = Payment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_payment_intent_id' => $paymentIntent->id,
            'amount' => $price,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
            'payment_id' => $payment->id,
            'amount' => $price,
            'course' => ['id' => $course->id, 'title' => $course->title],
        ]);
    }

    private function stripeConfigured(): bool
    {
        $secret = (string) config('services.stripe.secret');

        return str_starts_with($secret, 'sk_') && !str_contains($secret, 'your');
    }

    public function history(Request $request): JsonResponse
    {
        $payments = Payment::where('user_id', auth()->id())
            ->with('course:id,title,thumbnail')
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json($payments);
    }

    public function invoice(int $id): JsonResponse
    {
        $payment = Payment::where('user_id', auth()->id())
            ->with(['course:id,title', 'user:id,name,email'])
            ->findOrFail($id);

        return response()->json($payment);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentSuccess($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailure($event->data->object),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    private function handlePaymentSuccess($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$payment || $payment->status === 'completed') {
            return;
        }

        $payment->update(['status' => 'completed', 'stripe_charge_id' => $paymentIntent->latest_charge]);

        Enrollment::firstOrCreate(
            ['user_id' => $payment->user_id, 'course_id' => $payment->course_id],
            ['payment_id' => $payment->id, 'amount_paid' => $payment->amount]
        );

        $payment->course->increment('total_enrolled');
    }

    private function handlePaymentFailure($paymentIntent): void
    {
        Payment::where('stripe_payment_intent_id', $paymentIntent->id)
            ->update(['status' => 'failed']);
    }
}
