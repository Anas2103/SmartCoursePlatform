<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Lesson;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LessonProgressController extends Controller
{
    public function markComplete(Request $request, int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $user = auth()->user();

        // Ensure user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->firstOrFail();

        $progress = LessonProgress::updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lessonId],
            [
                'course_id' => $lesson->course_id,
                'is_completed' => true,
                'completed_at' => now(),
            ]
        );

        // Recalculate course progress
        $totalLessons = $lesson->course->total_lessons;
        $completedLessons = LessonProgress::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->where('is_completed', true)
            ->count();

        $percentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

        $enrollment->update([
            'progress_percentage' => $percentage,
            'completed_lessons' => $completedLessons,
            'last_accessed_at' => now(),
            'is_completed' => $percentage >= 100,
            'completed_at' => $percentage >= 100 ? now() : null,
        ]);

        // Generate certificate if course completed
        $certificate = null;
        if ($percentage >= 100 && $lesson->course->certificate_enabled) {
            $certificate = Certificate::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $lesson->course_id],
                [
                    'certificate_number' => strtoupper(Str::random(12)),
                    'issued_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'Lesson marked as complete.',
            'progress_percentage' => $percentage,
            'is_course_completed' => $percentage >= 100,
            'certificate' => $certificate,
        ]);
    }

    public function courseProgress(int $courseId): JsonResponse
    {
        $progress = LessonProgress::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->get(['lesson_id', 'is_completed', 'watch_time_seconds', 'completed_at']);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->first();

        return response()->json([
            'progress' => $progress->keyBy('lesson_id'),
            'percentage' => $enrollment?->progress_percentage ?? 0,
        ]);
    }
}
