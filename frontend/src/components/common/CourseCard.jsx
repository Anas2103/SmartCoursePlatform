import { Link } from 'react-router-dom';
import { Users, Clock, Star, BookOpen } from 'lucide-react';
import StarRating from './StarRating';
import clsx from 'clsx';

export default function CourseCard({ course, className = '' }) {
  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const levelColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-red-100 text-red-700',
    'all-levels': 'bg-gray-100 text-gray-600',
  };

  return (
    <Link to={`/courses/${course.slug}`} className={clsx('course-card block group', className)}>
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop`}
          alt={course.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.is_bestseller && (
          <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded">
            Bestseller
          </span>
        )}
        {course.discount_price && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            Sale
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx('badge text-xs', levelColors[course.level] || 'bg-gray-100 text-gray-600')}>
            {course.level}
          </span>
          {course.category && (
            <span className="text-xs text-gray-400">{course.category.name}</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        {course.teacher && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{course.teacher.name}</p>
        )}

        <div className="flex items-center gap-1 mb-3">
          <span className="text-sm font-bold text-amber-500">{Number(course.avg_rating).toFixed(1)}</span>
          <StarRating rating={course.avg_rating} size="sm" />
          <span className="text-xs text-gray-400">({course.total_reviews?.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.total_enrolled?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {course.total_lessons} lessons
          </span>
          {course.duration_minutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.duration_minutes)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {course.effective_price === 0 ? (
            <span className="text-lg font-bold text-emerald-600">Free</span>
          ) : (
            <>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${Number(course.effective_price).toFixed(2)}
              </span>
              {course.discount_price && (
                <span className="text-sm text-gray-400 line-through">
                  ${Number(course.price).toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
