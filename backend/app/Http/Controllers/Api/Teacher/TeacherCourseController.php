<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseDetailResource;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TeacherCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::where('teacher_id', auth()->id())
            ->withCount(['enrollments', 'lessons', 'reviews'])
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => CourseResource::collection($courses),
            'meta' => ['current_page' => $courses->currentPage(), 'last_page' => $courses->lastPage(), 'total' => $courses->total()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|in:beginner,intermediate,advanced,all-levels',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'language' => 'required|string|max:50',
            'requirements' => 'nullable|array',
            'learning_outcomes' => 'nullable|array',
            'target_audience' => 'nullable|array',
        ]);

        $validated['teacher_id'] = auth()->id();
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => new CourseDetailResource($course),
        ], 201);
    }

    public function show(Course $course): JsonResponse
    {
        $this->authorize('view', $course);
        $course->load(['sections.lessons', 'category', 'tags', 'faqs', 'quizzes', 'assignments']);

        return response()->json(new CourseDetailResource($course));
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'nullable|string|max:500',
            'category_id' => 'sometimes|exists:categories,id',
            'level' => 'sometimes|in:beginner,intermediate,advanced,all-levels',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'language' => 'sometimes|string|max:50',
            'requirements' => 'nullable|array',
            'learning_outcomes' => 'nullable|array',
            'target_audience' => 'nullable|array',
            'certificate_enabled' => 'boolean',
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => new CourseDetailResource($course->fresh()->load(['sections.lessons', 'category'])),
        ]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $this->authorize('delete', $course);

        if ($course->enrollments()->exists()) {
            return response()->json(['message' => 'Cannot delete a course with enrolled students.'], 422);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully.']);
    }

    public function publish(Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        if ($course->lessons()->count() === 0) {
            return response()->json(['message' => 'Add at least one lesson before publishing.'], 422);
        }

        $course->update(['status' => 'pending']);

        return response()->json(['message' => 'Course submitted for review.']);
    }

    public function unpublish(Course $course): JsonResponse
    {
        $this->authorize('update', $course);
        $course->update(['status' => 'draft']);

        return response()->json(['message' => 'Course unpublished.']);
    }

    public function uploadThumbnail(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);
        $request->validate(['thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120']);

        if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
        $course->update(['thumbnail' => $path]);

        return response()->json(['message' => 'Thumbnail uploaded.', 'thumbnail_url' => $course->fresh()->thumbnail_url]);
    }

    public function uploadIntroVideo(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);
        $request->validate(['video' => 'required|mimetypes:video/mp4,video/webm|max:204800']);

        $path = $request->file('video')->store('courses/videos', 'public');
        $course->update(['intro_video' => $path]);

        return response()->json(['message' => 'Intro video uploaded.', 'video_url' => asset('storage/' . $path)]);
    }

    // Sections
    public function addSection(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);
        $request->validate(['title' => 'required|string|max:255', 'description' => 'nullable|string']);

        $section = $course->sections()->create([
            'title' => $request->title,
            'description' => $request->description,
            'order' => $course->sections()->count() + 1,
        ]);

        return response()->json(['message' => 'Section added.', 'section' => $section], 201);
    }

    public function updateSection(Request $request, Section $section): JsonResponse
    {
        $this->authorize('update', $section->course);
        $section->update($request->validate(['title' => 'required|string|max:255', 'description' => 'nullable|string']));

        return response()->json(['message' => 'Section updated.', 'section' => $section->fresh()]);
    }

    public function deleteSection(Section $section): JsonResponse
    {
        $this->authorize('update', $section->course);
        $section->delete();

        return response()->json(['message' => 'Section deleted.']);
    }

    // Lessons
    public function addLesson(Request $request, Section $section): JsonResponse
    {
        $this->authorize('update', $section->course);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,text,pdf,quiz,assignment',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_free_preview' => 'boolean',
        ]);

        $lesson = $section->lessons()->create([
            ...$validated,
            'course_id' => $section->course_id,
            'order' => $section->lessons()->count() + 1,
        ]);

        // Update course lesson count
        $section->course->increment('total_lessons');

        return response()->json(['message' => 'Lesson added.', 'lesson' => $lesson], 201);
    }

    public function updateLesson(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson->course);

        $lesson->update($request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_free_preview' => 'boolean',
            'is_published' => 'boolean',
        ]));

        return response()->json(['message' => 'Lesson updated.', 'lesson' => $lesson->fresh()]);
    }

    public function deleteLesson(Lesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson->course);
        $lesson->course->decrement('total_lessons');
        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted.']);
    }

    public function uploadLessonVideo(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson->course);
        $request->validate(['video' => 'required|mimetypes:video/mp4,video/webm|max:1048576']);

        if ($lesson->video_url && Storage::disk('public')->exists($lesson->video_url)) {
            Storage::disk('public')->delete($lesson->video_url);
        }

        $path = $request->file('video')->store('lessons/videos', 'public');
        $lesson->update(['video_url' => $path]);

        return response()->json(['message' => 'Video uploaded.', 'video_url' => asset('storage/' . $path)]);
    }
}
