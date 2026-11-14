import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import { Video, Calendar, Clock, ExternalLink, Users, CheckCircle } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const PLATFORM_ICONS = { zoom: '🎥', google_meet: '📹', teams: '💼', other: '🔗' };

export default function LiveClasses() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ['live-sessions-upcoming'],
    queryFn: () => studentApi.getUpcomingLiveSessions(),
    select: (res) => res.data,
  });

  const { data: past } = useQuery({
    queryKey: ['live-sessions-past'],
    queryFn: () => studentApi.getPastLiveSessions(),
    select: (res) => res.data?.data || [],
  });

  const rsvpMutation = useMutation({
    mutationFn: (id) => studentApi.rsvpLiveSession(id),
    onSuccess: () => { toast.success('RSVP confirmed! Check your calendar.'); qc.invalidateQueries(['live-sessions-upcoming']); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">{t('liveClasses.title')}</h1>
        <p className="section-subtitle">{t('liveClasses.subtitle')}</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" /> {t('liveClasses.upcoming')}
        </h2>
        {!upcoming?.length ? (
          <EmptyState icon={Video} title={t('liveClasses.noUpcoming')} description={t('liveClasses.noUpcomingDesc')} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcoming.map((session) => (
              <div key={session.id} className="card p-5 border-l-4 border-primary-500">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-lg mr-2">{PLATFORM_ICONS[session.platform]}</span>
                    <span className="badge badge-primary capitalize text-xs">{session.platform.replace('_', ' ')}</span>
                  </div>
                  <span className={clsx('badge text-xs', session.status === 'live' ? 'badge-danger animate-pulse' : 'badge-gray')}>
                    {session.status === 'live' ? '● LIVE NOW' : 'Scheduled'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{session.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{session.description}</p>
                <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4" />{format(new Date(session.scheduled_at), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4" />{format(new Date(session.scheduled_at), 'h:mm a')} · {session.duration_minutes} min</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4" />{session.teacher?.name}</p>
                </div>
                <p className="text-xs text-primary-500 mb-3">{formatDistanceToNow(new Date(session.scheduled_at), { addSuffix: true })}</p>
                <div className="flex gap-2">
                  {session.status === 'live' ? (
                    <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-sm flex-1 justify-center">
                      <ExternalLink className="w-3 h-3" /> {t('liveClasses.join')}
                    </a>
                  ) : (
                    <>
                      <button onClick={() => rsvpMutation.mutate(session.id)} disabled={rsvpMutation.isPending} className="btn btn-primary btn-sm flex-1 justify-center">
                        <CheckCircle className="w-3 h-3" /> {t('liveClasses.rsvp')}
                      </button>
                      <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past sessions */}
      {past?.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('liveClasses.past')}</h2>
          <div className="space-y-3">
            {past.map((session) => (
              <div key={session.id} className="card p-4 flex items-center gap-4 opacity-75">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                  {PLATFORM_ICONS[session.platform]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{session.title}</p>
                  <p className="text-xs text-gray-400">{session.course?.title} · {format(new Date(session.scheduled_at), 'MMM d, yyyy')}</p>
                </div>
                {session.recording_url ? (
                  <a href={session.recording_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm shrink-0">
                    <Video className="w-3 h-3" /> {t('liveClasses.watchRecording')}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No recording</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
