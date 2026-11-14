import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/services/api';
import { BookOpen, Users, DollarSign, Star, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function TeacherDashboard() {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const gridColor = isDark ? '#374151' : '#f3f4f6';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderColor: isDark ? '#374151' : '#e5e7eb',
    color: isDark ? '#f9fafb' : '#111827',
    borderRadius: '10px',
    fontSize: '13px',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => teacherApi.getDashboard(),
    select: (res) => res.data,
  });

  const { data: analytics } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => teacherApi.getAnalytics(),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = data?.stats || {};

  const statCards = [
    { label: t('admin.totalCourses'), value: stats.total_courses, icon: BookOpen, color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30', sub: `${stats.published_courses} published` },
    { label: t('admin.totalStudents'), value: stats.total_students?.toLocaleString(), icon: Users, color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30', sub: 'enrolled students' },
    { label: t('admin.totalRevenue'), value: `$${Number(stats.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30', sub: `$${Number(stats.monthly_revenue || 0).toFixed(2)} this month` },
    { label: 'Avg Rating', value: Number(stats.avg_rating || 0).toFixed(1), icon: Star, color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30', sub: `${stats.total_reviews} reviews` },
  ];

  const enrollmentData = analytics?.enrollment_chart?.map((d) => ({
    month: `${d.month}/${d.year}`,
    enrollments: d.count,
  })) || [];

  const revenueData = analytics?.revenue_chart?.map((d) => ({
    month: `${d.month}/${d.year}`,
    revenue: Number(d.total),
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('nav.dashboard')}</h1>
          <p className="section-subtitle">{t('teacher.myCoursesSubtitle')}</p>
        </div>
        <Link to="/teacher/courses/create" className="btn btn-primary">
          <Plus className="w-4 h-4" /> {t('teacher.createCourse')}
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value || '0'}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('admin.totalStudents')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="enroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="enrollments" stroke="#6366f1" fill="url(#enroll)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('admin.totalRevenue')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Enrollments + Top Courses */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('teacher.recentStudents')}</h3>
            <Link to="/teacher/students" className="text-xs text-primary-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {data?.recent_enrollments?.slice(0, 5).map((enroll) => (
              <div key={enroll.id} className="flex items-center gap-3">
                <img src={enroll.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(enroll.user?.name || 'U')}&background=6366f1&color=fff`} alt={enroll.user?.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{enroll.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{enroll.course?.title}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {enroll.created_at ? format(new Date(enroll.created_at), 'MMM d') : ''}
                </span>
              </div>
            )) || <p className="text-gray-400 text-sm">No recent enrollments</p>}
          </div>
        </div>

        {/* Top Courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('teacher.topCourses')}</h3>
            <Link to="/teacher/courses" className="text-xs text-primary-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {data?.top_courses?.slice(0, 5).map((course, i) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-5">#{i + 1}</span>
                <img src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=40&h=40&fit=crop`} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">{course.enrollments_count} students</p>
                </div>
              </div>
            )) || <p className="text-gray-400 text-sm">No courses yet. <Link to="/teacher/courses/create" className="text-primary-600">Create one</Link></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
