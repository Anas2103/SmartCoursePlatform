<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_courses' => Course::count(),
            'published_courses' => Course::where('status', 'published')->count(),
            'pending_courses' => Course::where('status', 'pending')->count(),
            'total_enrollments' => Enrollment::count(),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'monthly_revenue' => Payment::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
        ];

        $recent_users = User::latest()->limit(5)->get(['id', 'name', 'email', 'role', 'created_at', 'avatar']);
        $recent_courses = Course::with('teacher:id,name')->latest()->limit(5)->get(['id', 'title', 'status', 'teacher_id', 'created_at', 'thumbnail']);
        $recent_payments = Payment::with(['user:id,name', 'course:id,title'])
            ->where('status', 'completed')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json(compact('stats', 'recent_users', 'recent_courses', 'recent_payments'));
    }

    public function analytics(): JsonResponse
    {
        // User growth (last 12 months)
        $user_growth = User::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        // Revenue (last 12 months)
        $revenue_chart = Payment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(amount) as total')
        )
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        // Enrollments by month
        $enrollment_chart = Enrollment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        // Top courses by enrollment
        $top_courses = Course::with('teacher:id,name')
            ->withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->limit(10)
            ->get(['id', 'title', 'thumbnail', 'teacher_id', 'avg_rating']);

        // Course status distribution
        $course_distribution = Course::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json(compact(
            'user_growth', 'revenue_chart', 'enrollment_chart',
            'top_courses', 'course_distribution'
        ));
    }
}
