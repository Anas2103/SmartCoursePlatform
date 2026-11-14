import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/services/api';
import { Video, Plus, Trash2, Edit2, Calendar, Clock, ExternalLink } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import EmptyState from '@/components/common/EmptyState';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = { scheduled: 'badge-primary', live: 'badge-danger', completed: 'badge-success', cancelled: 'badge-gray' };

export default function TeacherLiveSessions() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-live-sessions'],
    queryFn: () => teacherApi.getLiveSessions(),
    select: (res) => res.data?.data || [],
  });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-list'],
    queryFn: () => teacherApi.getCourses({ per_page: 100 }),
    select: (res) => res.data?.data || [],
  });

  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { platform: 'zoom', duration_minutes: 60 } });

  const openEdit = (session) => {
    setEditing(session);
    Object.entries(session).forEach(([k, v]) => setValue(k, v));
    setValue('scheduled_at', format(new Date(session.scheduled_at), "yyyy-MM-dd'T'HH:mm"));
    setModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? teacherApi.updateLiveSession(editing.id, data) : teacherApi.createLiveSession(data),
    onSuccess: () => {
      toast.success(editing ? 'Session updated!' : 'Session scheduled!');
      qc.invalidateQueries(['teacher-live-sessions']);
      setModal(false); setEditing(null); reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherApi.deleteLiveSession(id),
    onSuccess: () => { toast.success('Session cancelled.'); qc.invalidateQueries(['teacher-live-sessions']); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{t('teacher.liveSessions')}</h1>
          <p className="section-subtitle">{t('teacher.liveSessionsSubtitle')}</p>
        </div>
        <button onClick={() => { setEditing(null); reset(); setModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> {t('teacher.scheduleSession')}
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><Spinner /></div> :
      !sessions?.length ? (
        <EmptyState icon={Video} title={t('teacher.noSessions')} description={t('teacher.noSessionsDesc')} action={<button onClick={() => setModal(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> {t('teacher.scheduleSession')}</button>} />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="card p-5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{session.title}</h3>
                  <span className={clsx('badge text-xs capitalize', STATUS_COLORS[session.status] || 'badge-gray')}>{session.status}</span>
                </div>
                <p className="text-sm text-gray-500">{session.course?.title}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(session.scheduled_at), 'MMM d, yyyy h:mm a')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.duration_minutes} min</span>
                  <span className="capitalize">{session.platform.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-3 h-3" /> Link
                </a>
                <button onClick={() => openEdit(session)} className="btn btn-secondary btn-sm"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => deleteMutation.mutate(session.id)} className="btn btn-secondary btn-sm text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); setEditing(null); reset(); }} title={editing ? 'Edit Session' : t('teacher.scheduleSession')} size="lg">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">{t('teacher.selectCourse')} *</label>
            <select {...register('course_id', { required: true })} className="input">
              <option value="">{t('teacher.selectCourse')}</option>
              {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('teacher.sessionTitle')} *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. Week 3 Live Q&A" />
          </div>
          <div>
            <label className="label">{t('teacher.description')}</label>
            <textarea {...register('description')} rows={2} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Platform *</label>
              <select {...register('platform')} className="input">
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="teams">Microsoft Teams</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">{t('teacher.duration')} *</label>
              <input {...register('duration_minutes', { required: true })} type="number" min="15" max="480" className="input" />
            </div>
          </div>
          <div>
            <label className="label">{t('teacher.meetingUrl')} *</label>
            <input {...register('meeting_url', { required: true })} type="url" className="input" placeholder="https://zoom.us/j/..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Meeting ID</label>
              <input {...register('meeting_id')} className="input" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Password</label>
              <input {...register('meeting_password')} className="input" placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="label">{t('teacher.scheduledAt')} *</label>
            <input {...register('scheduled_at', { required: true })} type="datetime-local" className="input" />
          </div>
          {editing && (
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          {editing && (
            <div>
              <label className="label">Recording URL</label>
              <input {...register('recording_url')} type="url" className="input" placeholder="https://..." />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setModal(false); reset(); }} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
              {saveMutation.isPending && <Spinner size="sm" />}{editing ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
