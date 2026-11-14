<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'course_id' => 'required|exists:courses,id',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code.'], 422);
        }

        // Check if coupon is for a specific course
        if ($coupon->course_id && $coupon->course_id != $request->course_id) {
            return response()->json(['message' => 'This coupon is not valid for this course.'], 422);
        }

        if (!$coupon->isValid()) {
            return response()->json(['message' => 'This coupon has expired or reached its usage limit.'], 422);
        }

        // Check per-user limit
        $userUsages = $coupon->usages()->where('user_id', auth()->id())->count();
        if ($userUsages >= $coupon->per_user_limit) {
            return response()->json(['message' => 'You have already used this coupon.'], 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
            ],
        ]);
    }
}
