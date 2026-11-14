import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { BarChart2, DollarSign, Users, BookOpen } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useTranslation } from 'react-i18next';

export default function AdminReports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('month');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', period],
    queryFn: () => adminApi.getReports({ period }),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  const sections = [
    { title: 'Revenue', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100', items: [
      { label: 'Total Revenue', value: `$${Number(data?.revenue?.total || 0).toFixed(2)}` },
      { label: 'Refunded', value: `$${Number(data?.revenue?.refunded || 0).toFixed(2)}` },
      { label: 'Transactions', value: data?.revenue?.transactions?.toLocaleString() || '0' },
    ]},
    { title: 'Users', icon: Users, color: 'text-blue-600 bg-blue-100', items: [
      { label: 'New Users', value: data?.users?.new?.toLocaleString() || '0' },
      { label: 'New Students', value: data?.users?.students?.toLocaleString() || '0' },
      { label: 'New Teachers', value: data?.users?.teachers?.toLocaleString() || '0' },
    ]},
    { title: 'Courses', icon: BookOpen, color: 'text-purple-600 bg-purple-100', items: [
      { label: 'New Courses', value: data?.courses?.new?.toLocaleString() || '0' },
      { label: 'Published', value: data?.courses?.published?.toLocaleString() || '0' },
      { label: 'Enrollments', value: data?.courses?.enrollments?.toLocaleString() || '0' },
    ]},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('admin.reports')}</h1>
          <p className="section-subtitle">{t('admin.reportsSubtitle')}</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input w-40">
          <option value="week">{t('admin.thisWeek')}</option>
          <option value="month">{t('admin.thisMonth')}</option>
          <option value="quarter">{t('admin.thisQuarter')}</option>
          <option value="year">{t('admin.thisYear')}</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Top Earners */}
      {data?.top_earners?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('admin.topTeachers')}</h3>
          <div className="space-y-3">
            {data.top_earners.map((teacher, i) => (
              <div key={teacher.id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-300 w-6 text-center">#{i + 1}</span>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=6366f1&color=fff`} alt={teacher.name} className="w-8 h-8 rounded-full" />
                <span className="font-medium text-sm flex-1">{teacher.name}</span>
                <span className="font-bold text-emerald-600">${Number(teacher.revenue || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
