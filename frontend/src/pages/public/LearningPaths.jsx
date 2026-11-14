import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { publicApi } from '@/services/api';
import { BookOpen, Clock, ArrowRight, Users, ChevronRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';

export default function LearningPaths() {
  const { data: paths, isLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => publicApi.getLearningPaths(),
    select: (res) => res.data?.data || res.data || [],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Paths</h1>
          <p className="text-xl text-white/80">Structured roadmaps to master a skill, from beginner to expert.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths?.map((path) => (
              <Link key={path.id} to={`/learning-paths/${path.slug}`} className="card card-hover overflow-hidden group">
                {path.thumbnail_url ? (
                  <img src={path.thumbnail_url} alt={path.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/60" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary capitalize text-xs">{path.level}</span>
                    {path.estimated_hours > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{path.estimated_hours}h</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{path.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{path.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" /> {path.courses_count} courses
                    </span>
                    <div className="flex items-center gap-2">
                      {path.discount_price ? (
                        <>
                          <span className="text-sm text-gray-400 line-through">${Number(path.price).toFixed(2)}</span>
                          <span className="font-bold text-primary-600">${Number(path.discount_price).toFixed(2)}</span>
                        </>
                      ) : Number(path.price) === 0 ? (
                        <span className="font-bold text-emerald-600">Free</span>
                      ) : (
                        <span className="font-bold text-gray-900 dark:text-gray-100">${Number(path.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
