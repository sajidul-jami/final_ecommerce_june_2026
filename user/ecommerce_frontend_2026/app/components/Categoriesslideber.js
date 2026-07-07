import { API_BASE_URL } from '@/app/lib/api';
import CategoryHeroClient from './CategoryHeroClient';

export function CategoryHeroSkeleton() {
  return (
    <section id="categories" className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1180px] gap-3 px-2 py-3 sm:px-3 sm:py-4 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-lg bg-white p-3 text-slate-900 shadow-xl shadow-slate-950/10">
          <div className="mb-3 h-10 animate-pulse rounded bg-slate-100" />
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        </aside>
        <div className="min-h-[240px] animate-pulse rounded-lg bg-slate-800 sm:min-h-[320px]" />
      </div>
    </section>
  );
}

async function fetchPublic(path) {
  if (!API_BASE_URL) return [];

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Categoriesslideber() {
  const [categories, sliders] = await Promise.all([
    fetchPublic('/categories'),
    fetchPublic('/sliders'),
  ]);

  return <CategoryHeroClient initialCategories={categories} initialSliders={sliders} />;
}
