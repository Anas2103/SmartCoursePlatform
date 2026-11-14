import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Spinner from '@/components/common/Spinner';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
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
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    select: (res) => res.data,
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = data?.stats || {};

  const statCards = [
    { label: t('admin.totalUsers'), value: stats.total_users?.toLocaleString(), icon: Users, iconClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-100 dark:bg-blue-900/30', change: `+${stats.new_users_today} today` },
    { label: t('admin.totalCourses'), value: stats.total_courses?.toLocaleString(), icon: BookOpen, iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-100 dark:bg-purple-900/30', change: `${stats.published_courses} published` },
    { label: t('admin.totalRevenue'), value: `$${Number(stats.total_revenue || 0).toFixed(2)}`, icon: DollarSign, iconClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30', change: `$${Number(stats.monthly_revenue || 0).toFixed(2)} this month` },
    { label: t('admin.totalStudents'), value: stats.total_students?.toLocaleString(), icon: TrendingUp, iconClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-100 dark:bg-orange-900/30', change: `${stats.total_enrollments} enrollments` },
  ];

  const revenueData = analytics?.revenue_chart?.map((d) => ({
    month: `${d.month}/${d.year}`,
    revenue: Number(d.total),
  })) || [];

  const userGrowthData = analytics?.user_growth?.map((d) => ({
    month: `${d.month}/${d.year}`,
    users: d.count,
  })) || [];

  const courseDistribution = analytics?.course_distribution?.map((d, i) => ({
    name: d.status,
    value: d.count,
    color: COLORS[i],
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('admin.dashboard')}</h1>
          <p className="section-subtitle">{t('admin.dashboardSubtitle')}</p>
        </div>
        <span className="badge badge-primary">{format(new Date(), 'MMMM d, yyyy')}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className={`w-10 h-10 ${stat.bgClass} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('admin.revenueChart')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('admin.userGrowth')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Data + Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Course Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('admin.courseStatus')}</h3>
          {courseDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={courseDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {courseDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {courseDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm">No data available</p>}
        </div>

        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('admin.recentUsers')}</h3>
            <Link to="/admin/users" className="text-xs text-primary-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {data?.recent_users?.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} alt={user.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('admin.pendingReview')}</h3>
            <Link to="/admin/courses?status=pending" className="text-xs text-primary-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {data?.recent_courses?.filter(c => c.status === 'pending').slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center gap-3">
                <img src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=40&h=40&fit=crop`} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                  <span className="badge badge-warning text-xs">{course.status}</span>
                </div>
              </div>
            )) || <p className="text-gray-400 text-sm">No pending courses</p>}
          </div>
          {stats.pending_courses > 0 && (
            <Link to="/admin/courses?status=pending" className="btn btn-primary w-full mt-4 btn-sm">
              Review {stats.pending_courses} Pending
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
