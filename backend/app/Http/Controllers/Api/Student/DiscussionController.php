<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseDiscussion;
use App\Models\DiscussionReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionController extends Controller
{
    public function index(int $courseId): JsonResponse
    {
        $discussions = CourseDiscussion::where('course_id', $courseId)
            ->with('user:id,name,avatar')
            ->withCount('replies')
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate(15);

        return response()->json($discussions);
    }

    public function store(Request $request, int $courseId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|min:5|max:255',
            'body' => 'required|string|min:10',
        ]);

        $discussion = CourseDiscussion::create([
            'course_id' => $courseId,
            'user_id' => auth()->id(),
            'title' => $request->title,
            'body' => $request->body,
        ]);

        $discussion->load('user:id,name,avatar');
        return response()->json($discussion, 201);
    }

    public function show(int $id): JsonResponse
    {
        $discussion = CourseDiscussion::with([
            'user:id,name,avatar',
            'replies' => fn($q) => $q->whereNull('parent_id')->with('user:id,name,avatar', 'children.user:id,name,avatar'),
        ])->findOrFail($id);

        $discussion->increment('views');

        return response()->json($discussion);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate(['body' => 'required|string|min:5']);

        $discussion = CourseDiscussion::findOrFail($id);

        if ($discussion->is_locked && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'This discussion is locked.'], 403);
        }

        $reply = DiscussionReply::create([
            'discussion_id' => $id,
            'user_id' => auth()->id(),
            'parent_id' => $request->parent_id,
            'body' => $request->body,
        ]);

        $discussion->increment('replies_count');
        $reply->load('user:id,name,avatar');

        return response()->json($reply, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $discussion = CourseDiscussion::findOrFail($id);

        if ($discussion->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $discussion->delete();
        return response()->json(['message' => 'Discussion deleted.']);
    }
}
