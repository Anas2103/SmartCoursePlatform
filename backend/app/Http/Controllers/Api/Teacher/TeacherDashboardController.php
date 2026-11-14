<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TeacherDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $teacher = auth()->user();

        $courses = Course::where('teacher_id', $teacher->id)->get();
        $courseIds = $courses->pluck('id');

        $stats = [
            'total_courses' => $courses->count(),
            'published_courses' => $courses->where('status', 'published')->count(),
            'draft_courses' => $courses->where('status', 'draft')->count(),
            'total_students' => Enrollment::whereIn('course_id', $courseIds)->distinct('user_id')->count(),
            'total_revenue' => Payment::whereIn('course_id', $courseIds)->where('status', 'completed')->sum('amount'),
            'monthly_revenue' => Payment::whereIn('course_id', $courseIds)
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'avg_rating' => $courses->avg('avg_rating') ?? 0,
            'total_reviews' => $courses->sum('total_reviews'),
        ];

        $recent_enrollments = Enrollment::whereIn('course_id', $courseIds)
            ->with(['user:id,name,avatar,email', 'course:id,title,thumbnail'])
            ->latest()
            ->limit(5)
            ->get();

        $top_courses = Course::where('teacher_id', $teacher->id)
            ->withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->limit(5)
            ->get();

        return response()->json(compact('stats', 'recent_enrollments', 'top_courses'));
    }

    public function analytics(): JsonResponse
    {
        $teacher = auth()->user();
        $courseIds = Course::where('teacher_id', $teacher->id)->pluck('id');

        $enrollment_chart = Enrollment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereIn('course_id', $courseIds)
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        $revenue_chart = Payment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(amount) as total')
        )
        ->whereIn('course_id', $courseIds)
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        return response()->json(compact('enrollment_chart', 'revenue_chart'));
    }
}
