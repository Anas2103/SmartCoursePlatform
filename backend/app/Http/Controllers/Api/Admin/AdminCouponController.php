<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::with('course:id,title')
            ->latest()
            ->paginate(15);

        return response()->json($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        $coupon = Coupon::create([
            ...$request->only(['code', 'type', 'value', 'min_order_amount', 'max_discount', 'usage_limit', 'per_user_limit', 'is_active', 'starts_at', 'expires_at', 'course_id']),
            'code' => strtoupper($request->code),
        ]);

        return response()->json($coupon, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => "string|unique:coupons,code,{$id}|max:50",
            'type' => 'in:percentage,fixed',
            'value' => 'numeric|min:0',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $coupon->update($request->only(['code', 'type', 'value', 'min_order_amount', 'max_discount', 'usage_limit', 'per_user_limit', 'is_active', 'starts_at', 'expires_at', 'course_id']));

        return response()->json($coupon);
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted.']);
    }
}
