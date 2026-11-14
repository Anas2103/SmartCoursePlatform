<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherQuizController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $quizzes = Quiz::whereHas('course', fn($q) => $q->where('teacher_id', auth()->id()))
            ->with(['course:id,title', 'lesson:id,title'])
            ->withCount('questions')
            ->latest()
            ->paginate(10);

        return response()->json($quizzes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_percentage' => 'required|integer|min:1|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'show_answers' => 'boolean',
            'randomize_questions' => 'boolean',
        ]);

        $quiz = Quiz::create($validated);

        return response()->json(['message' => 'Quiz created.', 'quiz' => $quiz], 201);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        return response()->json($quiz->load('questions'));
    }

    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        $quiz->update($request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_percentage' => 'sometimes|integer|min:1|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'show_answers' => 'boolean',
            'is_active' => 'boolean',
        ]));

        return response()->json(['message' => 'Quiz updated.', 'quiz' => $quiz->fresh()]);
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted.']);
    }

    public function addQuestion(Request $request, Quiz $quiz): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:single,multiple,true_false',
            'options' => 'required|array|min:2',
            'correct_answers' => 'required|array|min:1',
            'explanation' => 'nullable|string',
            'points' => 'required|integer|min:1',
        ]);

        $validated['order'] = $quiz->questions()->count() + 1;
        $question = $quiz->questions()->create($validated);

        return response()->json(['message' => 'Question added.', 'question' => $question], 201);
    }

    public function updateQuestion(Request $request, QuizQuestion $question): JsonResponse
    {
        $question->update($request->validate([
            'question' => 'sometimes|string',
            'options' => 'sometimes|array|min:2',
            'correct_answers' => 'sometimes|array|min:1',
            'explanation' => 'nullable|string',
            'points' => 'sometimes|integer|min:1',
        ]));

        return response()->json(['message' => 'Question updated.', 'question' => $question->fresh()]);
    }

    public function deleteQuestion(QuizQuestion $question): JsonResponse
    {
        $question->delete();

        return response()->json(['message' => 'Question deleted.']);
    }
}
