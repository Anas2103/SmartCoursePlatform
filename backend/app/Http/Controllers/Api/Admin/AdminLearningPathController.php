<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminLearningPathController extends Controller
{
    public function index(): JsonResponse
    {
        $paths = LearningPath::withCount('courses')->latest()->paginate(15);
        return response()->json($paths);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'level' => 'in:beginner,intermediate,advanced,all-levels',
            'price' => 'numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'exists:courses,id',
            'estimated_hours' => 'integer|min:0',
        ]);

        $path = LearningPath::create([
            ...$request->only(['title', 'description', 'level', 'price', 'discount_price', 'is_active', 'estimated_hours']),
            'slug' => Str::slug($request->title),
        ]);

        $courses = collect($request->course_ids)->mapWithKeys(fn($id, $i) => [$id => ['position' => $i]]);
        $path->courses()->sync($courses);

        return response()->json($path->load('courses:id,title'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $path = LearningPath::findOrFail($id);

        $path->update($request->only(['title', 'description', 'level', 'price', 'discount_price', 'is_active', 'estimated_hours']));

        if ($request->has('course_ids')) {
            $courses = collect($request->course_ids)->mapWithKeys(fn($id, $i) => [$id => ['position' => $i]]);
            $path->courses()->sync($courses);
        }

        return response()->json($path);
    }

    public function destroy(int $id): JsonResponse
    {
        LearningPath::findOrFail($id)->delete();
        return response()->json(['message' => 'Learning path deleted.']);
    }

    public function show(int $id): JsonResponse
    {
        $path = LearningPath::with('courses:id,title,thumbnail,price,level')->findOrFail($id);
        return response()->json($path);
    }
}
