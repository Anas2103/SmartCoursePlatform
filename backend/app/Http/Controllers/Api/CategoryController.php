<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::active()
            ->roots()
            ->withCount('courses')
            ->with('children')
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->active()->firstOrFail();

        $courses = $category->courses()
            ->published()
            ->with(['teacher:id,name,avatar', 'category:id,name,slug'])
            ->withCount(['enrollments', 'reviews'])
            ->paginate(12);

        return response()->json([
            'category' => $category,
            'courses' => $courses,
        ]);
    }
}
