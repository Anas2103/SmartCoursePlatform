<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Resources\CourseDetailResource;
use App\Http\Resources\ReviewResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['teacher:id,name,avatar,headline', 'category:id,name,slug'])
            ->published()
            ->withCount(['enrollments', 'reviews', 'lessons']);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Category filter
        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        // Level filter
        if ($request->level) {
            $query->where('level', $request->level);
        }

        // Price filter
        if ($request->min_price !== null) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price !== null) {
            $query->where('price', '<=', $request->max_price);
        }

        // Rating filter
        if ($request->min_rating) {
            $query->where('avg_rating', '>=', $request->min_rating);
        }

        // Free courses
        if ($request->free) {
            $query->where('price', 0);
        }

        // Sorting
        $sortBy = $request->get('sort', 'newest');
        match ($sortBy) {
            'popular' => $query->orderByDesc('total_enrolled'),
            'rating' => $query->orderByDesc('avg_rating'),
            'price_low' => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            default => $query->orderByDesc('published_at'),
        };

        $courses = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => CourseResource::collection($courses),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function featured(): JsonResponse
    {
        $courses = Course::with(['teacher:id,name,avatar', 'category:id,name,slug'])
            ->published()
            ->featured()
            ->withCount(['enrollments', 'reviews'])
            ->limit(8)
            ->get();

        return response()->json(CourseResource::collection($courses));
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        $courses = Course::with(['teacher:id,name', 'category:id,name'])
            ->published()
            ->where('title', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json(CourseResource::collection($courses));
    }

    public function show(string $slug): JsonResponse
    {
        $course = Course::with([
            'teacher:id,name,avatar,bio,headline',
            'category:id,name,slug',
            'sections.lessons',
            'tags:id,name,slug',
            'faqs',
        ])
        ->withCount(['enrollments', 'reviews', 'lessons'])
        ->where('slug', $slug)
        ->firstOrFail();

        // Check if authenticated user is enrolled
        $isEnrolled = false;
        $userProgress = null;
        if (auth('sanctum')->check()) {
            $enrollment = auth('sanctum')->user()->enrollments()->where('course_id', $course->id)->first();
            $isEnrolled = (bool) $enrollment;
            $userProgress = $enrollment?->progress_percentage;
        }

        return response()->json([
            'course' => new CourseDetailResource($course),
            'is_enrolled' => $isEnrolled,
            'user_progress' => $userProgress,
        ]);
    }

    public function reviews(string $slug): JsonResponse
    {
        $course = Course::where('slug', $slug)->firstOrFail();

        $reviews = $course->reviews()
            ->with('user:id,name,avatar')
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'total' => $reviews->total(),
                'avg_rating' => $course->avg_rating,
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }
}
