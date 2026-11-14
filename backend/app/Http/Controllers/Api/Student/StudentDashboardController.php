<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;

class StudentDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $enrollments = Enrollment::where('user_id', $user->id)
            ->with(['course:id,title,thumbnail,teacher_id,total_lessons,duration_minutes', 'course.teacher:id,name'])
            ->orderByDesc('last_accessed_at')
            ->get();

        $stats = [
            'enrolled_courses' => $enrollments->count(),
            'completed_courses' => $enrollments->where('is_completed', true)->count(),
            'in_progress_courses' => $enrollments->where('is_completed', false)->where('progress_percentage', '>', 0)->count(),
            'certificates' => $user->certificates()->count(),
            'avg_progress' => $enrollments->avg('progress_percentage') ?? 0,
        ];

        $recent_courses = $enrollments->sortByDesc('last_accessed_at')->take(4)->values();
        $certificates = $user->certificates()->with('course:id,title')->latest()->limit(5)->get();

        return response()->json(compact('stats', 'recent_courses', 'certificates'));
    }
}
