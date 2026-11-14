<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAssignmentController extends Controller
{
    public function index(): JsonResponse
    {
        $assignments = Assignment::whereHas('course', fn($q) => $q->where('teacher_id', auth()->id()))
            ->with(['course:id,title', 'lesson:id,title'])
            ->withCount('submissions')
            ->latest()
            ->paginate(10);

        return response()->json($assignments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'max_points' => 'required|integer|min:1',
            'due_date' => 'nullable|date|after:now',
            'allow_late_submission' => 'boolean',
            'allowed_file_types' => 'nullable|array',
            'max_file_size_mb' => 'integer|min:1|max:100',
        ]);

        $assignment = Assignment::create($validated);

        return response()->json(['message' => 'Assignment created.', 'assignment' => $assignment], 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        return response()->json($assignment->load('submissions.user:id,name,avatar'));
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $assignment->update($request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'instructions' => 'nullable|string',
            'max_points' => 'sometimes|integer|min:1',
            'due_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]));

        return response()->json(['message' => 'Assignment updated.', 'assignment' => $assignment->fresh()]);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }

    public function submissions(Assignment $assignment): JsonResponse
    {
        $submissions = $assignment->submissions()
            ->with('user:id,name,email,avatar')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($submissions);
    }

    public function grade(Request $request, AssignmentSubmission $submission): JsonResponse
    {
        $validated = $request->validate([
            'points_earned' => 'required|integer|min:0',
            'feedback' => 'nullable|string|max:2000',
        ]);

        $submission->update([
            ...$validated,
            'status' => 'graded',
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        return response()->json(['message' => 'Submission graded.', 'submission' => $submission->fresh()]);
    }
}
