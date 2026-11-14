import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi, studentApi } from '@/services/api';
import { BookOpen, Clock, Star, Check, ArrowRight, Users } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function LearningPathDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const { data: path, isLoading } = useQuery({
    queryKey: ['learning-path', slug],
    queryFn: () => publicApi.getLearningPath(slug),
    select: (res) => res.data,
  });

  const enrollMutation = useMutation({
    mutationFn: () => studentApi.enrollLearningPath(path.id),
    onSuccess: () => toast.success('Enrolled in learning path!'),
    onError: (err) => toast.error(err.response?.data?.message || 'Enrollment failed.'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!path) return null;

  const totalCourses = path.courses?.length || 0;
  const totalHours = path.estimated_hours || path.courses?.reduce((sum, c) => sum + (c.total_lessons || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-purple-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/learning-paths" className="hover:text-white">Learning Paths</Link>
            <span>/</span>
            <span>{path.title}</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <span className="badge bg-white/20 text-white capitalize mb-3">{path.level}</span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{path.title}</h1>
              <p className="text-white/80 text-lg mb-6">{path.description}</p>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{totalCourses} courses</span>
                {path.estimated_hours > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{path.estimated_hours}h estimated</span>}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-4">
                {path.discount_price ? (
                  <>
                    <p className="text-4xl font-bold">${Number(path.discount_price).toFixed(2)}</p>
                    <p className="text-white/60 line-through">${Number(path.price).toFixed(2)}</p>
                  </>
                ) : Number(path.price) === 0 ? (
                  <p className="text-4xl font-bold">Free</p>
                ) : (
                  <p className="text-4xl font-bold">${Number(path.price).toFixed(2)}</p>
                )}
              </div>
              {path.is_enrolled ? (
                <Link to={`/student/courses/${path.courses?.[0]?.id}/learn`} className="btn btn-lg w-full justify-center bg-white text-primary-700 hover:bg-gray-100">
                  Continue Learning <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button onClick={() => isAuthenticated ? enrollMutation.mutate() : window.location.href = '/register'} disabled={enrollMutation.isPending} className="btn btn-lg w-full justify-center bg-white text-primary-700 hover:bg-gray-100">
                  {enrollMutation.isPending ? <Spinner size="sm" /> : null}
                  {Number(path.price) === 0 ? 'Enroll Free' : 'Get This Path'}
                </button>
              )}
              <p className="text-center text-xs text-white/50 mt-3">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Courses in this Path</h2>
        <div className="space-y-4">
          {path.courses?.map((course, i) => (
            <div key={course.id} className="card p-5 flex items-center gap-5">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 text-sm shrink-0">{i + 1}</div>
              <img src={course.thumbnail_url || 'https://placehold.co/64x40/6366f1/white?text=Course'} alt={course.title} className="w-20 h-14 rounded-lg object-cover shrink-0 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.teacher?.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {course.avg_rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(course.avg_rating).toFixed(1)}</span>}
                  <span className="badge badge-gray capitalize">{course.level}</span>
                </div>
              </div>
              <Link to={`/courses/${course.slug || course.id}`} className="btn btn-secondary btn-sm shrink-0">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
