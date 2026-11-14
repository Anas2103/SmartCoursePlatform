<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherStudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courseIds = Course::where('teacher_id', auth()->id())->pluck('id');

        $students = Enrollment::whereIn('course_id', $courseIds)
            ->with(['user:id,name,email,avatar', 'course:id,title,thumbnail'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($students);
    }

    public function courseStudents(Request $request, Course $course): JsonResponse
    {
        abort_if($course->teacher_id !== auth()->id(), 403);

        $students = $course->enrollments()
            ->with('user:id,name,email,avatar')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($students);
    }

    public function studentProgress(int $studentId, Course $course): JsonResponse
    {
        abort_if($course->teacher_id !== auth()->id(), 403);

        $enrollment = Enrollment::where('user_id', $studentId)
            ->where('course_id', $course->id)
            ->firstOrFail();

        $progress = LessonProgress::where('user_id', $studentId)
            ->where('course_id', $course->id)
            ->with('lesson:id,title,section_id,duration_minutes')
            ->get();

        return response()->json([
            'enrollment' => $enrollment,
            'progress' => $progress,
            'completed_lessons' => $progress->where('is_completed', true)->count(),
            'total_lessons' => $course->total_lessons,
        ]);
    }
}
