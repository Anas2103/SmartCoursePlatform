<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBundleController extends Controller
{
    public function index(): JsonResponse
    {
        $bundles = Bundle::withCount('courses')->latest()->paginate(15);
        return response()->json($bundles);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'course_ids' => 'required|array|min:2',
            'course_ids.*' => 'exists:courses,id',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $bundle = Bundle::create([
            ...$request->only(['title', 'description', 'price', 'compare_price', 'is_active', 'expires_at']),
            'slug' => Str::slug($request->title),
        ]);

        $courses = collect($request->course_ids)->mapWithKeys(fn($id, $i) => [$id => ['position' => $i]]);
        $bundle->courses()->sync($courses);

        $bundle->load('courses:id,title');
        return response()->json($bundle, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $bundle = Bundle::findOrFail($id);

        $request->validate([
            'title' => 'string|max:255',
            'price' => 'numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'course_ids' => 'array|min:2',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $bundle->update($request->only(['title', 'description', 'price', 'compare_price', 'is_active', 'expires_at']));

        if ($request->has('course_ids')) {
            $courses = collect($request->course_ids)->mapWithKeys(fn($id, $i) => [$id => ['position' => $i]]);
            $bundle->courses()->sync($courses);
        }

        return response()->json($bundle);
    }

    public function destroy(int $id): JsonResponse
    {
        Bundle::findOrFail($id)->delete();
        return response()->json(['message' => 'Bundle deleted.']);
    }

    public function show(int $id): JsonResponse
    {
        $bundle = Bundle::with('courses:id,title,thumbnail,price')->findOrFail($id);
        return response()->json($bundle);
    }
}
