<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    public function index(): JsonResponse
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->with(['course:id,title,slug,thumbnail,price,discount_price,avg_rating,total_reviews,level', 'course.teacher:id,name'])
            ->latest()
            ->get();

        return response()->json($wishlist);
    }

    public function toggle(int $courseId): JsonResponse
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['message' => 'Removed from wishlist.', 'in_wishlist' => false]);
        }

        Wishlist::create(['user_id' => auth()->id(), 'course_id' => $courseId]);

        return response()->json(['message' => 'Added to wishlist.', 'in_wishlist' => true]);
    }
}
