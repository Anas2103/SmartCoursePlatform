import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Search, DollarSign, TrendingUp } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Pagination from '@/components/common/Pagination';
import { format } from 'date-fns';
import clsx from 'clsx';

const statusColors = {
  completed: 'badge-success',
  pending: 'badge-warning',
  failed: 'badge-danger',
  refunded: 'badge-gray',
};

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, search, status],
    queryFn: () => adminApi.getPayments({ page, search, status, per_page: 15 }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Payments</h1>
          <p className="section-subtitle">Track all platform transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `$${Number(data?.meta?.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
          { label: 'Total Transactions', value: data?.meta?.total?.toLocaleString() || '0', icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
          { label: 'Pending', value: data?.data?.filter(p => p.status === 'pending').length || '0', icon: Search, color: 'text-amber-600 bg-amber-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user..." className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-full sm:w-40">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="th">User</th>
              <th className="th">Course</th>
              <th className="th">Amount</th>
              <th className="th">Status</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="td text-center py-10"><Spinner /></td></tr>
            ) : data?.data?.map((payment) => (
              <tr key={payment.id} className="tr-hover">
                <td className="td">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{payment.user?.name}</p>
                    <p className="text-xs text-gray-400">{payment.user?.email}</p>
                  </div>
                </td>
                <td className="td text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{payment.course?.title}</td>
                <td className="td font-semibold text-gray-900 dark:text-gray-100">${Number(payment.amount).toFixed(2)}</td>
                <td className="td">
                  <span className={clsx('badge capitalize', statusColors[payment.status] || 'badge-gray')}>{payment.status}</span>
                </td>
                <td className="td text-xs text-gray-400">{payment.created_at ? format(new Date(payment.created_at), 'MMM d, yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={data?.meta} onPageChange={setPage} />
    </div>
  );
}
