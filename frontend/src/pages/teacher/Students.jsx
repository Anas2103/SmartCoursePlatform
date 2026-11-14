import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/services/api';
import { Search, Users } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function TeacherStudents() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-students', page, search],
    queryFn: () => teacherApi.getStudents({ page, search, per_page: 15 }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('teacher.myStudents')}</h1>
          <p className="section-subtitle">{t('teacher.myStudentsSubtitle')}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.searchPlaceholder')} className="input pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !data?.data?.length ? (
        <EmptyState icon={Users} title={t('teacher.noStudents')} description={t('teacher.noStudentsDesc')} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">{t('teacher.colStudent')}</th>
                  <th className="th">{t('teacher.colCourse')}</th>
                  <th className="th">{t('teacher.colProgress')}</th>
                  <th className="th">{t('teacher.colEnrolled')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.data.map((enrollment) => (
                  <tr key={enrollment.id} className="tr-hover">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <img src={enrollment.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.user?.name || 'U')}&background=6366f1&color=fff`} alt={enrollment.user?.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{enrollment.user?.name}</p>
                          <p className="text-xs text-gray-400">{enrollment.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{enrollment.course?.title}</td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-24">
                          <div className="progress-fill" style={{ width: `${enrollment.progress_percentage}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{enrollment.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="td text-xs text-gray-400">
                      {enrollment.created_at ? format(new Date(enrollment.created_at), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
