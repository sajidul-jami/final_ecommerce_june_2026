import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL, PRODUCT_IMAGE_BASE_URL } from '@/app/lib/api';

async function getBrands() {
  if (!API_BASE_URL) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/brands`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

const imageUrl = (logo) => {
  if (!logo) return '';
  if (/^https?:\/\//i.test(logo) || logo.startsWith('/')) return logo;
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${logo}`;
};

export async function generateMetadata() {
  return {
    title: 'Brands',
    description: 'Shop all active brands and their products.',
    alternates: { canonical: '/brands' },
  };
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-5">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Brands</p>
          <h1 className="text-3xl font-black">Shop by Brand</h1>
        </div>

        {brands.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand) => {
              const logo = imageUrl(brand.logo);
              return (
                <Link
                  key={brand.id || brand.slug || brand.name}
                  href={`/brand/${brand.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
                >
                  <div className="mx-auto flex aspect-square max-w-32 items-center justify-center rounded-lg bg-slate-50 p-4">
                    {logo ? (
                      <Image src={logo} alt={brand.name || 'Brand'} width={140} height={140} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <span className="text-4xl font-black text-slate-300">{brand.name?.slice(0, 1)}</span>
                    )}
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-sm font-black text-slate-900">{brand.name}</h2>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No active brands found.
          </div>
        )}
      </section>
    </main>
  );
}
