import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from '@/services/api';
import { BookOpen, Award, Clock, TrendingUp, Play, ChevronRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentApi.getDashboard(),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const cards = [
    { label: t('dashboard.enrolledCourses'), value: stats?.enrolled_courses ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: t('dashboard.completedCourses'), value: stats?.completed_courses ?? 0, icon: Award, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('dashboard.hoursLearned'), value: stats?.total_hours ?? 0, icon: Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: t('dashboard.certificates'), value: stats?.certificates ?? 0, icon: TrendingUp, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('auth.welcomeBack')}, {user?.name?.split(' ')[0]}!</h1>
        <p className="section-subtitle">{t('dashboard.learningJourney')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {stats?.recent_enrollments?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.continueLearning')}</h2>
            <Link to="/student/courses" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              {t('dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recent_enrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <img
                  src={enrollment.course?.thumbnail_url || 'https://placehold.co/80x50/6366f1/white?text=Course'}
                  alt={enrollment.course?.title}
                  className="w-20 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{enrollment.course?.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{enrollment.course?.teacher?.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="progress-bar flex-1">
                      <div className="progress-fill" style={{ width: `${enrollment.progress_percentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{enrollment.progress_percentage}%</span>
                  </div>
                </div>
                <Link
                  to={`/student/courses/${enrollment.course_id}/learn`}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  <Play className="w-3 h-3" /> Resume
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Certificates */}
      {stats?.recent_certificates?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recentCertificates')}</h2>
            <Link to="/student/certificates" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              {t('dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {stats.recent_certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                <Award className="w-8 h-8 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{cert.course?.title}</p>
                  <p className="text-xs text-gray-500">{cert.issued_at ? format(new Date(cert.issued_at), 'MMM d, yyyy') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!stats?.recent_enrollments?.length && (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.startLearningToday')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('dashboard.startLearningDesc')}</p>
          <Link to="/courses" className="btn btn-primary">{t('courses.browseCourses')}</Link>
        </div>
      )}
    </div>
  );
}
