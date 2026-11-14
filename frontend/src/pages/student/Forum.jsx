import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from '@/services/api';
import { MessageSquare, Plus, Eye, ChevronRight, Pin } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Forum() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const { data: enrollments } = useQuery({
    queryKey: ['student-enrollments-list'],
    queryFn: () => studentApi.getEnrollments({ per_page: 100 }),
    select: (res) => res.data?.data || [],
  });

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['discussions', selectedCourse],
    queryFn: () => studentApi.getCourseDiscussions(selectedCourse),
    select: (res) => res.data,
    enabled: !!selectedCourse,
  });

  const { register, handleSubmit, reset } = useForm();
  const createMutation = useMutation({
    mutationFn: (data) => studentApi.createDiscussion(selectedCourse, data),
    onSuccess: () => {
      toast.success('Discussion created!');
      qc.invalidateQueries(['discussions', selectedCourse]);
      setShowNew(false);
      reset();
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{t('forum.title')}</h1>
          <p className="section-subtitle">{t('forum.subtitle')}</p>
        </div>
        {selectedCourse && (
          <button onClick={() => setShowNew(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> {t('forum.newDiscussion')}
          </button>
        )}
      </div>

      {/* Course selector */}
      <div className="flex gap-2 flex-wrap">
        {enrollments?.map((e) => (
          <button
            key={e.course_id}
            onClick={() => setSelectedCourse(e.course_id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all truncate max-w-[200px] ${
              selectedCourse === e.course_id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {e.course?.title}
          </button>
        ))}
      </div>

      {!selectedCourse ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('forum.selectCourse')}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !discussions?.data?.length ? (
        <EmptyState
          icon={MessageSquare}
          title={t('forum.noDiscussions')}
          description={t('forum.noDiscussionsDesc')}
          action={<button onClick={() => setShowNew(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> {t('forum.startDiscussion')}</button>}
        />
      ) : (
        <div className="space-y-3">
          {discussions.data.map((d) => (
            <Link key={d.id} to={`/student/discussions/${d.id}`} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {d.is_pinned && <Pin className="w-3 h-3 text-amber-500 shrink-0" />}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{d.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{d.body}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{d.user?.name}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{d.replies_count}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{d.views}</span>
                  <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title={t('forum.modalTitle')}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">{t('forum.topicTitle')}</label>
            <input {...register('title', { required: true })} className="input" placeholder={t('forum.titlePlaceholder')} />
          </div>
          <div>
            <label className="label">{t('forum.details')}</label>
            <textarea {...register('body', { required: true })} rows={4} className="input" placeholder={t('forum.detailsPlaceholder')} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowNew(false)} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
              {t('forum.post')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
