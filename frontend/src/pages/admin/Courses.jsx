import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Search, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const statusColors = {
  published: 'badge-success',
  pending: 'badge-warning',
  draft: 'badge-gray',
  rejected: 'badge-danger',
  archived: 'badge-gray',
};

export default function AdminCourses() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', page, search, status],
    queryFn: () => adminApi.getCourses({ page, search, status, per_page: 15 }),
    select: (res) => res.data,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveCourse(id),
    onSuccess: () => { toast.success('Course approved.'); qc.invalidateQueries(['admin-courses']); },
    onError: () => toast.error('Failed to approve course.'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectCourse(id, reason),
    onSuccess: () => { toast.success('Course rejected.'); qc.invalidateQueries(['admin-courses']); setRejectModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCourse(id),
    onSuccess: () => { toast.success('Course deleted.'); qc.invalidateQueries(['admin-courses']); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('admin.courseManagement')}</h1>
          <p className="section-subtitle">{t('admin.courseManagementSubtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.searchPlaceholder')} className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-full sm:w-40">
          <option value="">{t('admin.allStatus')}</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="th">{t('admin.colCourse')}</th>
              <th className="th">{t('admin.colTeacher')}</th>
              <th className="th">{t('admin.colStatus')}</th>
              <th className="th">{t('admin.colStudents')}</th>
              <th className="th">{t('admin.colPrice')}</th>
              <th className="th">{t('admin.colCreated')}</th>
              <th className="th">{t('admin.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={7} className="td text-center py-10"><Spinner /></td></tr>
            ) : data?.data?.map((course) => (
              <tr key={course.id} className="tr-hover">
                <td className="td max-w-xs">
                  <div className="flex items-center gap-3">
                    <img src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=40&h=40&fit=crop`} alt={course.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{course.title}</p>
                  </div>
                </td>
                <td className="td text-sm text-gray-500">{course.teacher?.name}</td>
                <td className="td">
                  <span className={clsx('badge capitalize', statusColors[course.status] || 'badge-gray')}>{course.status}</span>
                </td>
                <td className="td text-sm">{course.enrollments_count || 0}</td>
                <td className="td text-sm">{course.price === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}</td>
                <td className="td text-xs text-gray-400">{course.created_at ? format(new Date(course.created_at), 'MMM d, yyyy') : '-'}</td>
                <td className="td">
                  <div className="flex items-center gap-1">
                    <Link to={`/courses/${course.slug}`} target="_blank" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Preview">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {course.status === 'pending' && (
                      <>
                        <button onClick={() => approveMutation.mutate(course.id)} disabled={approveMutation.isPending} title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setRejectModal(course)} title="Reject" className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteMutation.mutate(course.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={data?.meta} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title={t('admin.rejectCourse')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.rejectReasonLabel')} "<strong>{rejectModal?.title}</strong>".</p>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="input" placeholder={t('admin.rejectReasonLabel')} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModal(null)} className="btn btn-secondary">{t('common.cancel')}</button>
            <button onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })} disabled={!rejectReason || rejectMutation.isPending} className="btn btn-danger">
              {rejectMutation.isPending && <Spinner size="sm" />}{t('admin.rejectCourse')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
