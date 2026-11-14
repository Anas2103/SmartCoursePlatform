<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentSubmissionController extends Controller
{
    public function store(Request $request, int $assignmentId): JsonResponse
    {
        $assignment = Assignment::findOrFail($assignmentId);

        if (!$assignment->is_active) {
            return response()->json(['message' => 'Assignment is closed.'], 422);
        }

        if ($assignment->due_date && now()->isAfter($assignment->due_date) && !$assignment->allow_late_submission) {
            return response()->json(['message' => 'Assignment deadline has passed.'], 422);
        }

        $validated = $request->validate([
            'content' => 'nullable|string|max:10000',
            'file' => 'nullable|file|max:' . ($assignment->max_file_size_mb * 1024),
        ]);

        $fileUrl = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('assignments/submissions', 'public');
            $fileUrl = $path;
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $status = $assignment->due_date && now()->isAfter($assignment->due_date) ? 'late' : 'submitted';

        $submission = AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignmentId, 'user_id' => auth()->id()],
            [
                'content' => $validated['content'] ?? null,
                'file_url' => $fileUrl,
                'file_name' => $fileName,
                'status' => $status,
                'points_earned' => null,
                'feedback' => null,
                'graded_by' => null,
                'graded_at' => null,
            ]
        );

        return response()->json(['message' => 'Assignment submitted.', 'submission' => $submission], 201);
    }

    public function show(int $assignmentId): JsonResponse
    {
        $submission = AssignmentSubmission::where('assignment_id', $assignmentId)
            ->where('user_id', auth()->id())
            ->with('gradedBy:id,name')
            ->first();

        return response()->json($submission);
    }
}
