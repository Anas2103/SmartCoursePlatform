import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import { CheckCircle, XCircle, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => studentApi.getQuiz(quizId),
    select: (res) => res.data,
  });

  const startMutation = useMutation({
    mutationFn: () => studentApi.startQuizAttempt(quizId),
    onSuccess: (res) => setAttemptId(res.data.attempt_id),
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot start quiz.'),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => studentApi.submitQuizAttempt(quizId, data),
    onSuccess: (res) => setResult(res.data),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit quiz.'),
  });

  const handleAnswer = (questionId, value, isMultiple) => {
    setAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: Number(questionId),
      answer: Array.isArray(answer) ? answer : answer,
    }));
    submitMutation.mutate({ attempt_id: attemptId, answers: formattedAnswers });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!quiz) return null;

  if (result) {
    const passed = result.score >= (quiz.passing_score || 70);
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className={clsx('card p-8 text-center', passed ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800')}>
          {passed
            ? <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            : <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          }
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{passed ? 'Congratulations!' : 'Almost There!'}</h2>
          <p className="text-gray-500 mb-6">{passed ? 'You passed the quiz!' : 'You did not pass this time. Review and try again.'}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.score}%</p>
              <p className="text-sm text-gray-500 mt-1">Your Score</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.correct}/{result.total}</p>
              <p className="text-sm text-gray-500 mt-1">Correct</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{quiz.passing_score || 70}%</p>
              <p className="text-sm text-gray-500 mt-1">Passing Score</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Back to Course
            </button>
            {!passed && (
              <button onClick={() => { setResult(null); setAttemptId(null); setAnswers({}); startMutation.mutate(); }} className="btn btn-primary">
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{quiz.title}</h2>
          <p className="text-gray-500 mb-6">{quiz.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.questions?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Questions</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.passing_score || 70}%</p>
              <p className="text-xs text-gray-500 mt-1">To Pass</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.max_attempts || '∞'}</p>
              <p className="text-xs text-gray-500 mt-1">Attempts</p>
            </div>
          </div>
          {quiz.time_limit_minutes && (
            <p className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" /> {quiz.time_limit_minutes} minutes time limit
            </p>
          )}
          <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="btn btn-primary btn-lg">
            {startMutation.isPending ? <Spinner size="sm" /> : <HelpCircle className="w-5 h-5" />}
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div>
          <h1 className="section-title">{quiz.title}</h1>
          <p className="text-sm text-gray-400">{Object.keys(answers).length}/{quiz.questions?.length} answered</p>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions?.map((question, qi) => {
          const isMultiple = question.type === 'multiple';
          const selected = answers[question.id];
          return (
            <div key={question.id} className="card p-6">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                <span className="text-primary-500 font-bold mr-2">Q{qi + 1}.</span>
                {question.question}
              </p>
              <div className="space-y-2">
                {question.options?.map((option, oi) => {
                  const optVal = typeof option === 'object' ? option.value : option;
                  const isSelected = isMultiple
                    ? (selected || []).includes(optVal)
                    : selected === optVal;
                  return (
                    <label
                      key={oi}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <input
                        type={isMultiple ? 'checkbox' : 'radio'}
                        name={`q-${question.id}`}
                        value={optVal}
                        checked={isSelected}
                        onChange={() => handleAnswer(question.id, optVal, isMultiple)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm">{typeof option === 'object' ? option.text : option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || Object.keys(answers).length === 0}
          className="btn btn-primary btn-lg"
        >
          {submitMutation.isPending && <Spinner size="sm" />}
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
