import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Spinner from '@/components/common/Spinner';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherAnalytics() {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#374151' : '#f3f4f6';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderColor: isDark ? '#374151' : '#e5e7eb',
    color: isDark ? '#f9fafb' : '#111827',
    borderRadius: '10px',
    fontSize: '13px',
  };

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => teacherApi.getAnalytics(),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const enrollmentData = analytics?.enrollment_chart?.map(d => ({ month: `${d.month}/${d.year}`, enrollments: d.count })) || [];
  const revenueData = analytics?.revenue_chart?.map(d => ({ month: `${d.month}/${d.year}`, revenue: Number(d.total) })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Analytics</h1>
        <p className="section-subtitle">Detailed performance metrics for your courses</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Monthly Enrollments</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="e" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="enrollments" stroke="#6366f1" fill="url(#e)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
