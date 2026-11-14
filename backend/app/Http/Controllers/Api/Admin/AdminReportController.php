<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');

        $startDate = match($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };

        return response()->json([
            'revenue' => [
                'total' => Payment::where('status', 'completed')->where('created_at', '>=', $startDate)->sum('amount'),
                'refunded' => Payment::where('status', 'refunded')->where('created_at', '>=', $startDate)->sum('refunded_amount'),
                'transactions' => Payment::where('status', 'completed')->where('created_at', '>=', $startDate)->count(),
            ],
            'users' => [
                'new' => User::where('created_at', '>=', $startDate)->count(),
                'students' => User::where('role', 'student')->where('created_at', '>=', $startDate)->count(),
                'teachers' => User::where('role', 'teacher')->where('created_at', '>=', $startDate)->count(),
            ],
            'courses' => [
                'new' => Course::where('created_at', '>=', $startDate)->count(),
                'published' => Course::where('status', 'published')->where('created_at', '>=', $startDate)->count(),
                'enrollments' => Enrollment::where('created_at', '>=', $startDate)->count(),
            ],
            'top_earners' => User::where('role', 'teacher')
                ->withSum(['courseSales as revenue' => fn($q) => $q->where('payments.status', 'completed')->where('payments.created_at', '>=', $startDate)], 'payments.amount')
                ->orderByDesc('revenue')
                ->limit(5)
                ->get(['id', 'name', 'avatar']),
        ]);
    }
}
