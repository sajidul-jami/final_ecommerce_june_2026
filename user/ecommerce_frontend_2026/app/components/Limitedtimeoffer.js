import { API_BASE_URL } from '@/app/lib/api';
import OffersClient from './OffersClient';

export function OffersSkeleton() {
  return (
    <section id="offers" className="mx-auto w-full max-w-[1180px] bg-slate-50 px-2 py-5 sm:px-3 lg:py-6">
      <div className="mb-4 h-7 w-40 animate-pulse rounded bg-slate-100" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[300px] w-[178px] shrink-0 animate-pulse rounded-lg bg-white shadow-sm sm:w-[210px]" />
        ))}
      </div>
    </section>
  );
}

async function fetchOffers() {
  if (!API_BASE_URL) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/offers`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Limitedtimeoffer() {
  const offers = await fetchOffers();
  return <OffersClient offers={offers} />;
}
