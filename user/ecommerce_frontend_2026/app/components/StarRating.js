'use client';

function Star({ fillPercent }) {
  const safeFill = Math.max(0, Math.min(Number(fillPercent || 0), 100));

  return (
    <span className="relative inline-block h-[1em] w-[1em] leading-none text-slate-300" aria-hidden="true">
      <span className="absolute inset-0">★</span>
      <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${safeFill}%` }}>
        ★
      </span>
    </span>
  );
}

export default function StarRating({ rating = 0, size = 'text-sm', showValue = false, count }) {
  const safeRating = Math.max(0, Math.min(Number(rating || 0), 5));

  return (
    <span className={`inline-flex items-center gap-1 ${size}`} aria-label={`${safeRating.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => {
          const fillPercent = Math.max(0, Math.min((safeRating - index) * 100, 100));
          return <Star key={index} fillPercent={fillPercent} />;
        })}
      </span>
      {showValue && (
        <span className="font-bold text-slate-600">
          {safeRating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
        </span>
      )}
    </span>
  );
}
