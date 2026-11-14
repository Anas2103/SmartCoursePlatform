import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, total } = meta;

  const pages = Array.from({ length: Math.min(last_page, 7) }, (_, i) => {
    if (last_page <= 7) return i + 1;
    if (current_page <= 4) return i + 1;
    if (current_page >= last_page - 3) return last_page - 6 + i;
    return current_page - 3 + i;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-gray-500">
        Showing page {current_page} of {last_page} ({total?.toLocaleString()} results)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="btn btn-secondary btn-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx('btn btn-sm w-9', page === current_page ? 'btn-primary' : 'btn-secondary')}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="btn btn-secondary btn-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
