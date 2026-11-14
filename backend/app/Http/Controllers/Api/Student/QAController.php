<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\LessonQuestion;
use App\Models\LessonAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QAController extends Controller
{
    public function questions(int $lessonId): JsonResponse
    {
        $questions = LessonQuestion::where('lesson_id', $lessonId)
            ->with(['user:id,name,avatar', 'answers.user:id,name,avatar'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('upvotes')
            ->latest()
            ->paginate(15);

        return response()->json($questions);
    }

    public function askQuestion(Request $request, int $lessonId): JsonResponse
    {
        $request->validate(['body' => 'required|string|min:10|max:2000']);

        $question = LessonQuestion::create([
            'lesson_id' => $lessonId,
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        $question->load('user:id,name,avatar');

        return response()->json($question, 201);
    }

    public function answer(Request $request, int $questionId): JsonResponse
    {
        $request->validate(['body' => 'required|string|min:5|max:5000']);

        $question = LessonQuestion::findOrFail($questionId);

        $answer = LessonAnswer::create([
            'question_id' => $questionId,
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        $answer->load('user:id,name,avatar');

        return response()->json($answer, 201);
    }

    public function upvoteQuestion(int $questionId): JsonResponse
    {
        $question = LessonQuestion::findOrFail($questionId);
        $question->increment('upvotes');
        return response()->json(['upvotes' => $question->upvotes]);
    }

    public function acceptAnswer(int $answerId): JsonResponse
    {
        $answer = LessonAnswer::with('question')->findOrFail($answerId);

        if ($answer->question->user_id !== auth()->id()) {
            return response()->json(['message' => 'Only the question author can accept an answer.'], 403);
        }

        LessonAnswer::where('question_id', $answer->question_id)->update(['is_accepted' => false]);
        $answer->update(['is_accepted' => true]);

        return response()->json(['message' => 'Answer accepted.']);
    }

    public function deleteQuestion(int $questionId): JsonResponse
    {
        $question = LessonQuestion::findOrFail($questionId);

        if ($question->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $question->delete();
        return response()->json(['message' => 'Question deleted.']);
    }
}
