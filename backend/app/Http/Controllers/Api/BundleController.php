<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use Illuminate\Http\JsonResponse;

class BundleController extends Controller
{
    public function index(): JsonResponse
    {
        $bundles = Bundle::active()
            ->withCount('courses')
            ->with('courses:id,title,thumbnail,avg_rating')
            ->latest()
            ->get();

        return response()->json($bundles);
    }

    public function show(string $slug): JsonResponse
    {
        $bundle = Bundle::where('slug', $slug)
            ->active()
            ->with([
                'courses' => fn($q) => $q->select('courses.id', 'title', 'thumbnail', 'level', 'avg_rating', 'total_enrollments', 'total_lessons', 'price', 'teacher_id')
                    ->with('teacher:id,name'),
            ])
            ->firstOrFail();

        return response()->json($bundle);
    }
}
