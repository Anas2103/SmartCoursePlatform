import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from '@/services/api';
import { Heart } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import CourseCard from '@/components/common/CourseCard';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Wishlist() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['student-wishlist'],
    queryFn: () => studentApi.getWishlist(),
    select: (res) => res.data,
  });

  const toggleMutation = useMutation({
    mutationFn: (courseId) => studentApi.toggleWishlist(courseId),
    onSuccess: () => {
      toast.success('Removed from wishlist.');
      qc.invalidateQueries(['student-wishlist']);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const count = wishlist?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('wishlist.title')}</h1>
        <p className="section-subtitle">{count} {count === 1 ? t('wishlist.savedCourse') : t('wishlist.savedCourses')}</p>
      </div>

      {!wishlist?.length ? (
        <EmptyState
          icon={Heart}
          title={t('wishlist.empty')}
          description={t('wishlist.emptyDesc')}
          action={<Link to="/courses" className="btn btn-primary">{t('courses.browseCourses')}</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((item) => (
            <div key={item.id} className="relative">
              <CourseCard course={item.course} />
              <button
                onClick={() => toggleMutation.mutate(item.course_id)}
                disabled={toggleMutation.isPending}
                title={t('wishlist.remove')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
