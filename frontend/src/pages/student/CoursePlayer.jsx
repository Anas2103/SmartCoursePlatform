import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import ReactPlayer from 'react-player';
import {
  ChevronDown, ChevronUp, Check, Play, FileText, HelpCircle,
  ArrowLeft, Menu, X, Star, StickyNote, MessageSquare, Plus, Trash2, Send
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const LESSON_ICONS = { video: Play, text: FileText, pdf: FileText, quiz: HelpCircle, assignment: FileText };

export default function CoursePlayer() {
  const { courseId } = useParams();
  const qc = useQueryClient();
  const playerRef = useRef(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment-detail', courseId],
    queryFn: () => studentApi.getEnrollment(courseId),
    select: (res) => res.data,
  });

  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ['lesson-notes', activeLesson?.id],
    queryFn: () => studentApi.getLessonNotes(activeLesson.id),
    select: (res) => res.data,
    enabled: !!activeLesson?.id && activeTab === 'notes',
  });

  const { data: questions, refetch: refetchQA } = useQuery({
    queryKey: ['lesson-qa', activeLesson?.id],
    queryFn: () => studentApi.getLessonQuestions(activeLesson.id),
    select: (res) => res.data,
    enabled: !!activeLesson?.id && activeTab === 'qa',
  });

  useEffect(() => {
    if (enrollment && !activeLesson) {
      const firstSection = enrollment.course?.sections?.[0];
      const firstLesson = firstSection?.lessons?.[0];
      if (firstLesson) { setActiveLesson(firstLesson); setExpandedSection(firstSection.id); }
    }
  }, [enrollment]);

  const markCompleteMutation = useMutation({
    mutationFn: (lessonId) => studentApi.markLessonComplete(lessonId),
    onSuccess: () => { toast.success('Lesson completed! +10 XP'); qc.invalidateQueries(['enrollment-detail', courseId]); },
  });

  const { register: noteReg, handleSubmit: noteSub, reset: noteReset } = useForm();
  const addNoteMutation = useMutation({
    mutationFn: (data) => studentApi.addNote(activeLesson.id, { ...data, timestamp_seconds: Math.floor(playedSeconds) }),
    onSuccess: () => { toast.success('Note saved!'); noteReset(); refetchNotes(); },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => studentApi.deleteNote(id),
    onSuccess: () => refetchNotes(),
  });

  const { register: qaReg, handleSubmit: qaSub, reset: qaReset } = useForm();
  const askMutation = useMutation({
    mutationFn: (data) => studentApi.askQuestion(activeLesson.id, data),
    onSuccess: () => { toast.success('Question posted!'); qaReset(); refetchQA(); },
  });

  const answerMutation = useMutation({
    mutationFn: ({ questionId, body }) => studentApi.answerQuestion(questionId, { body }),
    onSuccess: () => { toast.success('Answer posted!'); refetchQA(); },
  });

  const { register: revReg, handleSubmit: revSub, reset: revReset } = useForm({ defaultValues: { rating: 5 } });
  const reviewMutation = useMutation({
    mutationFn: (data) => studentApi.submitReview(courseId, data),
    onSuccess: () => { toast.success('Review submitted!'); setShowReviewForm(false); revReset(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review.'),
  });

  const isLessonCompleted = (lessonId) => enrollment?.progress?.some(p => p.lesson_id === lessonId && p.completed);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="card p-10 text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">You're not enrolled in this course</h1>
          <p className="text-gray-500 mb-6">Enroll from the course page to start learning, or pick one of your existing courses.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/courses" className="btn btn-secondary">Browse courses</Link>
            <Link to="/student/courses" className="btn btn-primary">My courses</Link>
          </div>
        </div>
      </div>
    );
  }

  const course = enrollment.course;
  const totalLessons = course?.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;
  const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;

  const TABS = [
    { key: 'content', label: 'Content', icon: FileText },
    { key: 'notes', label: 'Notes', icon: StickyNote },
    { key: 'qa', label: 'Q&A', icon: HelpCircle },
    { key: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className={clsx('flex-shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-all duration-300 no-scrollbar', sidebarOpen ? 'w-80' : 'w-0')}>
        {sidebarOpen && (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold text-white text-sm line-clamp-2">{course?.title}</h2>
              <p className="text-xs text-gray-400 mt-1">{completedLessons}/{totalLessons} lessons</p>
              <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${enrollment.progress_percentage}%` }} /></div>
            </div>
            <div className="space-y-1">
              {course?.sections?.map((section) => (
                <div key={section.id}>
                  <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-gray-800 transition-colors">
                    <span className="text-sm font-medium text-gray-200 line-clamp-1">{section.title}</span>
                    {expandedSection === section.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {expandedSection === section.id && (
                    <div className="ml-2 space-y-0.5">
                      {section.lessons?.map((lesson) => {
                        const Icon = LESSON_ICONS[lesson.type] || Play;
                        const completed = isLessonCompleted(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        return (
                          <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={clsx('w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs transition-colors', isActive ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200')}>
                            {completed ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <Icon className="w-3 h-3 shrink-0" />}
                            <span className="line-clamp-2 flex-1">{lesson.title}</span>
                            {lesson.duration_minutes > 0 && <span className="ml-auto shrink-0 text-gray-500">{lesson.duration_minutes}m</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/student/courses" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> My Courses
            </Link>
          </div>
          <h1 className="text-sm font-medium text-white hidden md:block line-clamp-1 max-w-md">{activeLesson?.title}</h1>
          {activeLesson && !isLessonCompleted(activeLesson.id) && (
            <button onClick={() => markCompleteMutation.mutate(activeLesson.id)} disabled={markCompleteMutation.isPending} className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border-0">
              {markCompleteMutation.isPending ? <Spinner size="sm" /> : <Check className="w-3 h-3" />} Mark Complete
            </button>
          )}
          {activeLesson && isLessonCompleted(activeLesson.id) && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><Check className="w-3 h-3" /> Completed</span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          {activeLesson ? (
            <div>
              {activeLesson.type === 'video' && (
                <div className="bg-black aspect-video max-h-[60vh]">
                  {activeLesson.video_url ? (
                    <ReactPlayer ref={playerRef} url={activeLesson.video_url} width="100%" height="100%" controls
                      onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
                      onEnded={() => { if (!isLessonCompleted(activeLesson.id)) markCompleteMutation.mutate(activeLesson.id); }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center"><Play className="w-16 h-16 mx-auto mb-2 opacity-30" /><p className="text-sm">No video uploaded yet</p></div>
                    </div>
                  )}
                </div>
              )}

              <div className="max-w-4xl mx-auto p-6">
                <div className="flex gap-1 border-b border-gray-800 mb-6 overflow-x-auto no-scrollbar">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)} className={clsx('flex items-center gap-1.5 pb-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors', activeTab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-gray-200')}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">{activeLesson.title}</h2>
                    {activeLesson.content && <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{activeLesson.content}</div>}
                    {activeLesson.type === 'quiz' && activeLesson.quiz_id && (
                      <Link to={`/student/quizzes/${activeLesson.quiz_id}`} className="btn btn-primary mt-4 inline-flex">Take Quiz</Link>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={noteSub((d) => addNoteMutation.mutate(d))} className="flex gap-2">
                      <input {...noteReg('content', { required: true })} className="input flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500" placeholder="Add a note at this moment..." />
                      <button type="submit" disabled={addNoteMutation.isPending} className="btn btn-primary shrink-0">
                        {addNoteMutation.isPending ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </form>
                    {activeLesson.type === 'video' && (
                      <p className="text-xs text-gray-500">Current position: {Math.floor(playedSeconds)}s — your note will be timestamped here</p>
                    )}
                    {notes?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No notes yet. Add your first note above.</p>}
                    <div className="space-y-3">
                      {notes?.map((note) => (
                        <div key={note.id} className="flex gap-3 bg-gray-800/50 rounded-xl p-3">
                          {note.timestamp_seconds > 0 && (
                            <button onClick={() => playerRef.current?.seekTo(note.timestamp_seconds)} className="text-xs text-primary-400 hover:text-primary-300 shrink-0 font-mono bg-gray-700 px-2 py-1 rounded">
                              {Math.floor(note.timestamp_seconds / 60)}:{String(note.timestamp_seconds % 60).padStart(2, '0')}
                            </button>
                          )}
                          <p className="text-sm text-gray-300 flex-1">{note.content}</p>
                          <button onClick={() => deleteNoteMutation.mutate(note.id)} className="text-gray-600 hover:text-red-400 shrink-0 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q&A Tab */}
                {activeTab === 'qa' && (
                  <div className="space-y-6">
                    <form onSubmit={qaSub((d) => askMutation.mutate(d))} className="flex gap-2">
                      <input {...qaReg('body', { required: true })} className="input flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500" placeholder="Ask a question about this lesson..." />
                      <button type="submit" disabled={askMutation.isPending} className="btn btn-primary shrink-0">
                        {askMutation.isPending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                    {questions?.data?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No questions yet. Be the first to ask!</p>}
                    <div className="space-y-4">
                      {questions?.data?.map((q) => (
                        <QuestionItem key={q.id} question={q} onAnswer={(body) => answerMutation.mutate({ questionId: q.id, body })} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    {enrollment.progress_percentage === 100 && !showReviewForm && (
                      <button onClick={() => setShowReviewForm(true)} className="btn btn-primary mb-6"><Star className="w-4 h-4" /> Write a Review</button>
                    )}
                    {showReviewForm && (
                      <form onSubmit={revSub((d) => reviewMutation.mutate(d))} className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
                        <div>
                          <label className="label text-gray-300">Rating</label>
                          <select {...revReg('rating')} className="input bg-gray-700 border-gray-600 text-white">
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label text-gray-300">Review</label>
                          <textarea {...revReg('comment')} rows={3} className="input bg-gray-700 border-gray-600 text-white" placeholder="Share your experience..." />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary">Cancel</button>
                          <button type="submit" disabled={reviewMutation.isPending} className="btn btn-primary">{reviewMutation.isPending && <Spinner size="sm" />}Submit</button>
                        </div>
                      </form>
                    )}
                    {enrollment.progress_percentage < 100 && (
                      <p className="text-gray-500 text-sm">Complete the course to leave a review.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center"><Play className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Select a lesson to begin</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionItem({ question, onAnswer }) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex gap-3 mb-3">
        <img src={question.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.user?.name || 'U')}&background=6366f1&color=fff`} alt="" className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-200">{question.user?.name}</p>
          <p className="text-sm text-gray-300 mt-1">{question.body}</p>
        </div>
      </div>
      {question.answers?.map((ans) => (
        <div key={ans.id} className={clsx('ml-8 mt-2 p-3 rounded-lg flex gap-3', ans.is_accepted ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-gray-700/30')}>
          <img src={ans.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ans.user?.name || 'U')}&background=10b981&color=fff`} alt="" className="w-6 h-6 rounded-full shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-300 flex items-center gap-1">
              {ans.user?.name}
              {ans.is_accepted && <span className="badge badge-success text-xs">✓ Accepted</span>}
            </p>
            <p className="text-sm text-gray-300 mt-0.5">{ans.body}</p>
          </div>
        </div>
      ))}
      <button onClick={() => setShowReply(!showReply)} className="ml-8 mt-2 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> Reply
      </button>
      {showReply && (
        <div className="ml-8 mt-2 flex gap-2">
          <input value={reply} onChange={(e) => setReply(e.target.value)} className="input flex-1 bg-gray-700 border-gray-600 text-white text-sm" placeholder="Write your answer..." />
          <button onClick={() => { if (reply.trim()) { onAnswer(reply); setReply(''); setShowReply(false); } }} className="btn btn-sm btn-primary">
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
