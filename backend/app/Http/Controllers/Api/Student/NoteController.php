<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\LessonNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(int $lessonId): JsonResponse
    {
        $notes = LessonNote::where('lesson_id', $lessonId)
            ->where('user_id', auth()->id())
            ->orderBy('timestamp_seconds')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request, int $lessonId): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|min:1',
            'timestamp_seconds' => 'integer|min:0',
        ]);

        $note = LessonNote::create([
            'lesson_id' => $lessonId,
            'user_id' => auth()->id(),
            'content' => $request->content,
            'timestamp_seconds' => $request->timestamp_seconds ?? 0,
        ]);

        return response()->json($note, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $note = LessonNote::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $request->validate(['content' => 'required|string|min:1']);
        $note->update(['content' => $request->content]);
        return response()->json($note);
    }

    public function destroy(int $id): JsonResponse
    {
        LessonNote::where('id', $id)->where('user_id', auth()->id())->firstOrFail()->delete();
        return response()->json(['message' => 'Note deleted.']);
    }

    public function allNotes(): JsonResponse
    {
        $notes = LessonNote::where('user_id', auth()->id())
            ->with('lesson:id,title,section_id', 'lesson.section:id,title,course_id', 'lesson.section.course:id,title')
            ->latest()
            ->get();

        return response()->json($notes);
    }
}
