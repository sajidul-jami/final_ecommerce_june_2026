export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading products">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="aspect-square animate-pulse bg-slate-100" />
          <div className="space-y-2 p-3 sm:p-4">
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-8/12 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-6/12 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-7/12 animate-pulse rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="h-9 animate-pulse rounded bg-slate-100" />
              <div className="h-9 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
