<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminSubscriptionController extends Controller
{
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::withCount(['subscriptions as active_subscribers' => fn($q) => $q->where('status', 'active')])
            ->get();

        return response()->json($plans);
    }

    public function storePlan(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $plan = SubscriptionPlan::create([
            ...$request->only(['name', 'description', 'monthly_price', 'yearly_price', 'features', 'is_active', 'is_featured']),
            'slug' => Str::slug($request->name),
        ]);

        return response()->json($plan, 201);
    }

    public function updatePlan(Request $request, int $id): JsonResponse
    {
        $plan = SubscriptionPlan::findOrFail($id);
        $plan->update($request->only(['name', 'description', 'monthly_price', 'yearly_price', 'features', 'is_active', 'is_featured']));
        return response()->json($plan);
    }

    public function subscribers(): JsonResponse
    {
        $subs = UserSubscription::with(['user:id,name,email', 'plan:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json($subs);
    }
}
