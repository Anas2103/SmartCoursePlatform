<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    public function index(): JsonResponse
    {
        $enrollments = Enrollment::where('user_id', auth()->id())
            ->with([
                'course:id,title,thumbnail,teacher_id,total_lessons,duration_minutes,avg_rating',
                'course.teacher:id,name,avatar',
                'course.category:id,name',
            ])
            ->orderByDesc('last_accessed_at')
            ->paginate(12);

        return response()->json($enrollments);
    }

    public function show(int $courseId): JsonResponse
    {
        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment->load([
            'course.sections.lessons',
            'course.teacher:id,name,avatar,bio',
        ]);

        $lessonProgress = LessonProgress::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->get(['lesson_id', 'is_completed', 'watch_time_seconds'])
            ->keyBy('lesson_id');

        return response()->json([
            'enrollment' => $enrollment,
            'lesson_progress' => $lessonProgress,
        ]);
    }
}
