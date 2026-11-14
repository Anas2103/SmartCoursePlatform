<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    public function show(int $quizId): JsonResponse
    {
        $quiz = Quiz::with(['questions' => function ($q) {
            $q->select('id', 'quiz_id', 'question', 'type', 'options', 'points');
        }])->findOrFail($quizId);

        $attemptsCount = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quizId)
            ->where('status', 'completed')
            ->count();

        return response()->json([
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'time_limit_minutes' => $quiz->time_limit_minutes,
            'passing_score' => $quiz->passing_percentage,
            'max_attempts' => $quiz->max_attempts,
            'attempts_used' => $attemptsCount,
            'questions' => $quiz->questions,
        ]);
    }

    public function start(int $quizId): JsonResponse
    {
        $quiz = Quiz::with('questions')->findOrFail($quizId);

        if (!$quiz->is_active) {
            return response()->json(['message' => 'Quiz is not available.'], 422);
        }

        if ($quiz->max_attempts) {
            $attempts = QuizAttempt::where('user_id', auth()->id())
                ->where('quiz_id', $quizId)
                ->where('status', 'completed')
                ->count();

            if ($attempts >= $quiz->max_attempts) {
                return response()->json(['message' => 'Maximum attempts reached.'], 422);
            }
        }

        // End any in-progress attempts
        QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quizId)
            ->where('status', 'in_progress')
            ->update(['status' => 'timed_out']);

        $attempt = QuizAttempt::create([
            'user_id' => auth()->id(),
            'quiz_id' => $quizId,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json(['attempt_id' => $attempt->id]);
    }

    public function submit(Request $request, int $quizId): JsonResponse
    {
        $attempt = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quizId)
            ->where('status', 'in_progress')
            ->latest()
            ->firstOrFail();

        $request->validate(['answers' => 'required|array']);

        $quiz = Quiz::with('questions')->findOrFail($quizId);

        // Normalize answers: frontend sends [{question_id, answer}] array or keyed object
        $rawAnswers = $request->answers;
        $answersMap = [];
        if (isset($rawAnswers[0]) && is_array($rawAnswers[0]) && isset($rawAnswers[0]['question_id'])) {
            foreach ($rawAnswers as $a) {
                $answersMap[$a['question_id']] = $a['answer'];
            }
        } else {
            $answersMap = $rawAnswers;
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $correct = 0;

        foreach ($quiz->questions as $question) {
            $totalPoints += $question->points;
            $userAnswer = $answersMap[$question->id] ?? null;
            $isCorrect = false;

            if ($userAnswer !== null) {
                $correctAnswers = $question->correct_answers;
                if (is_array($userAnswer)) {
                    sort($userAnswer);
                    $ca = $correctAnswers;
                    sort($ca);
                    $isCorrect = $userAnswer == $ca;
                } else {
                    $isCorrect = in_array($userAnswer, (array) $correctAnswers);
                }
            }

            if ($isCorrect) {
                $earnedPoints += $question->points;
                $correct++;
            }
        }

        $percentage = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;
        $isPassed = $percentage >= $quiz->passing_percentage;
        $timeTaken = now()->diffInSeconds($attempt->started_at);

        $attempt->update([
            'answers' => $answersMap,
            'score' => $earnedPoints,
            'total_points' => $totalPoints,
            'percentage' => $percentage,
            'is_passed' => $isPassed,
            'time_taken_seconds' => $timeTaken,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'score' => $percentage,
            'correct' => $correct,
            'total' => $quiz->questions->count(),
            'is_passed' => $isPassed,
            'passing_score' => $quiz->passing_percentage,
        ]);
    }

    public function history(int $quizId): JsonResponse
    {
        $attempts = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quizId)
            ->orderByDesc('created_at')
            ->get(['id', 'score', 'total_points', 'percentage', 'is_passed', 'time_taken_seconds', 'status', 'completed_at']);

        return response()->json($attempts);
    }
}
