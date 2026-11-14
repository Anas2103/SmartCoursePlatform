import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/services/api';
import { Plus, Edit2, Trash2, Eye, Globe, Lock, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Pagination from '@/components/common/Pagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const statusColors = {
  published: 'badge-success',
  pending: 'badge-warning',
  draft: 'badge-gray',
  rejected: 'badge-danger',
};

export default function TeacherCourses() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-courses', page],
    queryFn: () => teacherApi.getCourses({ page }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherApi.deleteCourse(id),
    onSuccess: () => { toast.success('Course deleted.'); qc.invalidateQueries(['teacher-courses']); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete this course.'),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, action }) => action === 'publish' ? teacherApi.publishCourse(id) : teacherApi.unpublishCourse(id),
    onSuccess: (_, { action }) => {
      toast.success(action === 'publish' ? 'Course submitted for review.' : 'Course unpublished.');
      qc.invalidateQueries(['teacher-courses']);
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('nav.myCourses')}</h1>
          <p className="section-subtitle">{t('teacher.myCoursesSubtitle')}</p>
        </div>
        <Link to="/teacher/courses/create" className="btn btn-primary">
          <Plus className="w-4 h-4" /> {t('teacher.createCourse')}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.data?.length ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('teacher.noCourses')}</h3>
          <p className="text-gray-500 mb-6">{t('teacher.noCoursesDesc')}</p>
          <Link to="/teacher/courses/create" className="btn btn-primary">
            <Plus className="w-4 h-4" /> {t('teacher.createCourse')}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.data.map((course) => (
              <div key={course.id} className="card overflow-hidden group">
                <div className="relative">
                  <img
                    src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop`}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={clsx('badge capitalize text-xs', statusColors[course.status] || 'badge-gray')}>{course.status}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-3">{course.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrollments_count || 0} students</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(course.avg_rating || 0).toFixed(1)}</span>
                    <span>${Number(course.effective_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/teacher/courses/${course.id}/edit`} className="btn btn-secondary btn-sm flex-1 justify-center">
                      <Edit2 className="w-3 h-3" /> {t('common.edit')}
                    </Link>
                    {course.status === 'draft' || course.status === 'rejected' ? (
                      <button onClick={() => publishMutation.mutate({ id: course.id, action: 'publish' })} disabled={publishMutation.isPending} className="btn btn-primary btn-sm">
                        <Globe className="w-3 h-3" /> Publish
                      </button>
                    ) : course.status === 'published' ? (
                      <button onClick={() => publishMutation.mutate({ id: course.id, action: 'unpublish' })} disabled={publishMutation.isPending} className="btn btn-secondary btn-sm">
                        Unpublish
                      </button>
                    ) : null}
                    <button onClick={() => setDeleteId(course.id)} className="btn btn-sm text-red-600 hover:bg-red-50 border-red-200 btn-outline">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
