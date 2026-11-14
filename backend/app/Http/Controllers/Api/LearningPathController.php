<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningPathController extends Controller
{
    public function index(): JsonResponse
    {
        $paths = LearningPath::active()
            ->withCount('courses')
            ->with('courses:id,title,thumbnail,level,avg_rating,total_enrollments')
            ->latest()
            ->paginate(12);

        return response()->json($paths);
    }

    public function show(string $slug): JsonResponse
    {
        $path = LearningPath::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'courses' => fn($q) => $q->select('courses.id', 'title', 'thumbnail', 'level', 'avg_rating', 'total_enrollments', 'total_lessons', 'price', 'teacher_id')
                    ->with('teacher:id,name'),
            ])
            ->firstOrFail();

        $isEnrolled = auth('sanctum')->check()
            ? LearningPathEnrollment::where('user_id', auth()->id())->where('learning_path_id', $path->id)->exists()
            : false;

        return response()->json([...$path->toArray(), 'is_enrolled' => $isEnrolled]);
    }

    public function enroll(int $id): JsonResponse
    {
        $path = LearningPath::findOrFail($id);

        $exists = LearningPathEnrollment::where('user_id', auth()->id())
            ->where('learning_path_id', $id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already enrolled.'], 422);
        }

        LearningPathEnrollment::create(['learning_path_id' => $id, 'user_id' => auth()->id()]);

        return response()->json(['message' => 'Enrolled in learning path!']);
    }
}
