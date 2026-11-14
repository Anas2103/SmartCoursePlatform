<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class AdminPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['user:id,name,email', 'course:id,title']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            );
        }

        $payments = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
                'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            ],
        ]);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load(['user', 'course']));
    }

    public function refund(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Payment cannot be refunded.'], 422);
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        $refund = $stripe->refunds->create([
            'charge' => $payment->stripe_charge_id,
            'amount' => intval($request->get('amount', $payment->amount) * 100),
        ]);

        $payment->update([
            'status' => 'refunded',
            'refunded_amount' => $payment->amount,
        ]);

        return response()->json(['message' => 'Refund processed successfully.']);
    }
}
