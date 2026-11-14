import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { publicApi } from '@/services/api';
import { Package, BookOpen, Tag } from 'lucide-react';
import Spinner from '@/components/common/Spinner';

export default function Bundles() {
  const { data: bundles, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: () => publicApi.getBundles(),
    select: (res) => res.data,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Course Bundles</h1>
          <p className="text-xl text-white/80">Get multiple courses at a massive discount.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles?.map((bundle) => {
              const savings = bundle.compare_price
                ? Math.round((1 - bundle.price / bundle.compare_price) * 100)
                : 0;
              return (
                <Link key={bundle.id} to={`/bundles/${bundle.slug}`} className="card card-hover overflow-hidden group">
                  {savings > 0 && (
                    <div className="bg-red-500 text-white text-center text-sm font-bold py-1.5">
                      Save {savings}%
                    </div>
                  )}
                  {bundle.thumbnail_url ? (
                    <img src={bundle.thumbnail_url} alt={bundle.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Package className="w-12 h-12 text-white/60" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{bundle.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{bundle.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span>{bundle.courses_count} courses included</span>
                    </div>
                    {/* Course thumbnails preview */}
                    <div className="flex -space-x-2 mb-4">
                      {bundle.courses?.slice(0, 4).map((c) => (
                        <img key={c.id} src={c.thumbnail_url || 'https://placehold.co/40x40/6366f1/white?text=C'} alt="" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                      ))}
                      {(bundle.courses_count || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">+{bundle.courses_count - 4}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {bundle.compare_price && (
                          <p className="text-sm text-gray-400 line-through">${Number(bundle.compare_price).toFixed(2)}</p>
                        )}
                        <p className="text-2xl font-bold text-emerald-600">${Number(bundle.price).toFixed(2)}</p>
                      </div>
                      <div className="btn btn-primary btn-sm">Get Bundle</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
