import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from '@/services/api';
import { BookOpen, Play, Award } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useTranslation } from 'react-i18next';

export default function MyCourses() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { t } = useTranslation();

  const STATUS_TABS = [
    { key: '', label: t('courses.all') },
    { key: 'in_progress', label: t('courses.inProgress') },
    { key: 'completed', label: t('courses.completed') },
    { key: 'not_started', label: t('courses.notStarted') },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['student-enrollments', page, status],
    queryFn: () => studentApi.getEnrollments({ page, status, per_page: 12 }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('courses.myCourses')}</h1>
        <p className="section-subtitle">{t('courses.trackProgress')}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              status === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={BookOpen}
          title={t('courses.noCoursesFound')}
          description={t('courses.enrollToStart')}
          action={<Link to="/courses" className="btn btn-primary">{t('courses.browseCourses')}</Link>}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((enrollment) => (
              <div key={enrollment.id} className="card card-hover overflow-hidden">
                <div className="relative">
                  <img
                    src={enrollment.course?.thumbnail_url || 'https://placehold.co/400x225/6366f1/white?text=Course'}
                    alt={enrollment.course?.title}
                    className="w-full h-40 object-cover"
                  />
                  {enrollment.progress_percentage === 100 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> Completed
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{enrollment.course?.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{enrollment.course?.teacher?.name}</p>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('courses.progress')}</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${enrollment.progress_percentage}%` }} />
                    </div>
                  </div>

                  <Link
                    to={`/student/courses/${enrollment.course_id}/learn`}
                    className="btn btn-primary btn-sm w-full justify-center"
                  >
                    <Play className="w-3 h-3" />
                    {enrollment.progress_percentage === 0 ? t('courses.start') : enrollment.progress_percentage === 100 ? t('courses.review') : t('courses.continue')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
