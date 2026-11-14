<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['teacher:id,name', 'category:id,name'])
            ->withCount(['enrollments', 'reviews']);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $courses = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => CourseResource::collection($courses),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function approve(Course $course): JsonResponse
    {
        $course->update(['status' => 'published', 'published_at' => now()]);

        // Notify teacher
        $course->teacher->notify(new \App\Notifications\CourseApproved($course));

        return response()->json(['message' => 'Course approved and published.']);
    }

    public function reject(Request $request, Course $course): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $course->update(['status' => 'rejected', 'rejection_reason' => $request->reason]);

        return response()->json(['message' => 'Course rejected.']);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully.']);
    }
}
