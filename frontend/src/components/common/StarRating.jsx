import clsx from 'clsx';

const Star = ({ filled, half, size = 'sm' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <svg className={clsx(sizes[size], filled || half ? 'text-amber-400' : 'text-gray-300')} fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      {half && (
        <defs>
          <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
};

export default function StarRating({ rating = 0, maxRating = 5, size = 'sm', showNumber = false }) {
  return (
    <div className="flex items-center gap-1">
      <div className="star-rating">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star key={i} filled={i < Math.floor(rating)} half={i === Math.floor(rating) && rating % 1 >= 0.5} size={size} />
        ))}
      </div>
      {showNumber && <span className="text-sm font-medium text-amber-600">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}
