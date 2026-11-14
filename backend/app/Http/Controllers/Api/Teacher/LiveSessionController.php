<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveSessionController extends Controller
{
    public function index(): JsonResponse
    {
        $sessions = LiveSession::where('teacher_id', auth()->id())
            ->with('course:id,title')
            ->orderBy('scheduled_at', 'desc')
            ->paginate(15);

        return response()->json($sessions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'platform' => 'required|in:zoom,google_meet,teams,other',
            'meeting_url' => 'required|url',
            'meeting_id' => 'nullable|string',
            'meeting_password' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
        ]);

        $course = Course::where('id', $request->course_id)
            ->where('teacher_id', auth()->id())
            ->firstOrFail();

        $session = LiveSession::create([
            ...$request->only(['course_id', 'title', 'description', 'platform', 'meeting_url', 'meeting_id', 'meeting_password', 'scheduled_at', 'duration_minutes']),
            'teacher_id' => auth()->id(),
        ]);

        $session->load('course:id,title');

        return response()->json($session, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $session = LiveSession::where('id', $id)->where('teacher_id', auth()->id())->firstOrFail();

        $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'platform' => 'in:zoom,google_meet,teams,other',
            'meeting_url' => 'url',
            'scheduled_at' => 'date',
            'duration_minutes' => 'integer|min:15|max:480',
            'status' => 'in:scheduled,live,completed,cancelled',
            'recording_url' => 'nullable|url',
        ]);

        $session->update($request->only([
            'title', 'description', 'platform', 'meeting_url', 'meeting_id',
            'meeting_password', 'scheduled_at', 'duration_minutes', 'status', 'recording_url',
        ]));

        return response()->json($session);
    }

    public function destroy(int $id): JsonResponse
    {
        LiveSession::where('id', $id)->where('teacher_id', auth()->id())->firstOrFail()->delete();
        return response()->json(['message' => 'Session cancelled.']);
    }
}
