<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        // Must be enrolled
        abort_unless(auth()->user()->enrollments()->where('course_id', $courseId)->exists(), 403, 'You must be enrolled to review.');

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = Review::updateOrCreate(
            ['user_id' => auth()->id(), 'course_id' => $courseId],
            $validated
        );

        $this->updateCourseRating($course);

        return response()->json(['message' => 'Review submitted.', 'review' => $review], 201);
    }

    public function update(Request $request, int $courseId): JsonResponse
    {
        $review = Review::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->firstOrFail();

        $review->update($request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]));

        $this->updateCourseRating($review->course);

        return response()->json(['message' => 'Review updated.', 'review' => $review->fresh()]);
    }

    public function destroy(int $courseId): JsonResponse
    {
        $review = Review::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->firstOrFail();

        $review->delete();
        $this->updateCourseRating(Course::find($courseId));

        return response()->json(['message' => 'Review deleted.']);
    }

    private function updateCourseRating(Course $course): void
    {
        $avgRating = $course->reviews()->where('is_approved', true)->avg('rating') ?? 0;
        $totalReviews = $course->reviews()->where('is_approved', true)->count();

        $course->update([
            'avg_rating' => round($avgRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }
}
