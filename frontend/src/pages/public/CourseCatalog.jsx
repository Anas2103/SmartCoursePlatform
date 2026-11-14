import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { coursesApi, categoriesApi } from '@/services/api';
import CourseCard from '@/components/common/CourseCard';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import clsx from 'clsx';

const levels = ['beginner', 'intermediate', 'advanced', 'all-levels'];
const ratings = [4.5, 4.0, 3.5];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    min_rating: searchParams.get('min_rating') || '',
    sort: searchParams.get('sort') || 'newest',
    free: searchParams.get('free') || '',
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean) && filters.sort !== 'newest';

  const { data, isLoading } = useQuery({
    queryKey: ['courses', filters, page],
    queryFn: () => coursesApi.getAll({ ...filters, page, per_page: 12 }),
    select: (res) => res.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Courses</h1>
        <p className="text-gray-500 mt-1">Discover your next skill from our catalog of courses</p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input w-full sm:w-48"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('btn btn-outline gap-2', showFilters && 'bg-primary-50 text-primary-600 border-primary-300')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="badge badge-primary ml-1">Active</span>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-64 shrink-0 space-y-6">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <h4 className="label mb-2">Category</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button onClick={() => updateFilter('category', '')} className={clsx('block w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors', !filters.category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800')}>
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button key={cat.id} onClick={() => updateFilter('category', cat.slug)} className={clsx('block w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors', filters.category === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800')}>
                      {cat.name} <span className="text-xs text-gray-400">({cat.courses_count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="mb-5">
                <h4 className="label mb-2">Level</h4>
                <div className="space-y-1">
                  {levels.map((level) => (
                    <button key={level} onClick={() => updateFilter('level', filters.level === level ? '' : level)} className={clsx('block w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize', filters.level === level ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800')}>
                      {level.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-5">
                <h4 className="label mb-2">Minimum Rating</h4>
                <div className="space-y-1">
                  {ratings.map((r) => (
                    <button key={r} onClick={() => updateFilter('min_rating', filters.min_rating == r ? '' : r)} className={clsx('flex items-center gap-2 w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors', filters.min_rating == r ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800')}>
                      <span className="text-amber-400">{'★'.repeat(Math.floor(r))}</span> {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="label mb-2">Price</h4>
                <button onClick={() => updateFilter('free', filters.free ? '' : '1')} className={clsx('block w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors', filters.free ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800')}>
                  Free Only
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Course Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : !data?.data?.length ? (
            <EmptyState title="No courses found" description="Try adjusting your filters or search query." />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{data.meta?.total?.toLocaleString()} courses found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.data.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
              <Pagination meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
