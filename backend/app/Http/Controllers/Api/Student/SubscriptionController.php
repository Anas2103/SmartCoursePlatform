<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription;

class SubscriptionController extends Controller
{
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::active()->get();
        $mySubscription = UserSubscription::where('user_id', auth()->id())
            ->where('status', 'active')
            ->with('plan')
            ->latest()
            ->first();

        return response()->json(['plans' => $plans, 'current' => $mySubscription]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $secret = (string) config('services.stripe.secret');
        $stripeConfigured = str_starts_with($secret, 'sk_') && !str_contains($secret, 'your');

        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'payment_method_id' => $stripeConfigured ? 'required|string' : 'nullable|string',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $user = auth()->user();

        // Demo mode: no real Stripe key configured -> activate the plan directly
        if (!$stripeConfigured) {
            UserSubscription::where('user_id', $user->id)->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            $sub = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_cycle' => $request->billing_cycle,
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $request->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth(),
            ]);

            return response()->json(['message' => 'Subscription activated (demo mode)!', 'subscription' => $sub->load('plan')]);
        }

        Stripe::setApiKey($secret);

        try {
            // Create or get Stripe customer
            $customerId = UserSubscription::where('user_id', $user->id)
                ->whereNotNull('stripe_customer_id')
                ->value('stripe_customer_id');

            if (!$customerId) {
                $customer = Customer::create([
                    'email' => $user->email,
                    'name' => $user->name,
                    'payment_method' => $request->payment_method_id,
                    'invoice_settings' => ['default_payment_method' => $request->payment_method_id],
                ]);
                $customerId = $customer->id;
            }

            $priceId = $request->billing_cycle === 'yearly'
                ? $plan->stripe_yearly_price_id
                : $plan->stripe_monthly_price_id;

            if (!$priceId) {
                return response()->json(['message' => 'Stripe price not configured for this plan.'], 422);
            }

            $stripeSubscription = Subscription::create([
                'customer' => $customerId,
                'items' => [['price' => $priceId]],
                'expand' => ['latest_invoice.payment_intent'],
            ]);

            UserSubscription::where('user_id', $user->id)->where('status', 'active')->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            $sub = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'stripe_subscription_id' => $stripeSubscription->id,
                'stripe_customer_id' => $customerId,
                'billing_cycle' => $request->billing_cycle,
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $request->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth(),
            ]);

            return response()->json(['message' => 'Subscription activated!', 'subscription' => $sub->load('plan')]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel(): JsonResponse
    {
        $sub = UserSubscription::where('user_id', auth()->id())
            ->where('status', 'active')
            ->first();

        if (!$sub) {
            return response()->json(['message' => 'No active subscription found.'], 404);
        }

        if ($sub->stripe_subscription_id) {
            Stripe::setApiKey(config('services.stripe.secret'));
            try {
                Subscription::retrieve($sub->stripe_subscription_id)->cancel();
            } catch (\Exception) {}
        }

        $sub->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        return response()->json(['message' => 'Subscription cancelled.']);
    }
}
