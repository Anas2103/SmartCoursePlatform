<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;

class LiveSessionController extends Controller
{
    public function upcoming(): JsonResponse
    {
        $enrolledCourseIds = Enrollment::where('user_id', auth()->id())->pluck('course_id');

        $sessions = LiveSession::whereIn('course_id', $enrolledCourseIds)
            ->upcoming()
            ->with(['course:id,title', 'teacher:id,name,avatar'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json($sessions);
    }

    public function past(): JsonResponse
    {
        $enrolledCourseIds = Enrollment::where('user_id', auth()->id())->pluck('course_id');

        $sessions = LiveSession::whereIn('course_id', $enrolledCourseIds)
            ->past()
            ->with(['course:id,title', 'teacher:id,name,avatar'])
            ->orderByDesc('scheduled_at')
            ->paginate(10);

        return response()->json($sessions);
    }

    public function rsvp(int $id): JsonResponse
    {
        $session = LiveSession::findOrFail($id);

        $enrolled = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $session->course_id)
            ->exists();

        if (!$enrolled) {
            return response()->json(['message' => 'You are not enrolled in this course.'], 403);
        }

        $session->attendees()->syncWithoutDetaching([auth()->id() => ['joined_at' => now()]]);

        return response()->json(['message' => 'RSVP confirmed!']);
    }
}
