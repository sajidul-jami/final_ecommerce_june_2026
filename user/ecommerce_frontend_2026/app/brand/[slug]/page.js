import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_BASE_URL, PRODUCT_IMAGE_BASE_URL } from '@/app/lib/api';
import BrandProductsClient from './BrandProductsClient';

async function getBrand(slug) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

const imageUrl = (logo) => {
  if (!logo) return '';
  if (/^https?:\/\//i.test(logo) || logo.startsWith('/')) return logo;
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${logo}`;
};

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    return {
      title: 'Brand not found',
      description: 'The requested brand could not be found.',
    };
  }

  const description = brand.seo_description || stripHtml(brand.description).slice(0, 155) || `Shop ${brand.name} products in Bangladesh.`;

  return {
    title: brand.seo_title || `${brand.name} Products`,
    description,
    keywords: brand.seo_keywords || undefined,
    alternates: { canonical: `/brand/${brand.slug}` },
    openGraph: {
      title: brand.seo_title || brand.name,
      description,
      type: 'website',
      images: imageUrl(brand.logo) ? [imageUrl(brand.logo)] : [],
    },
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    notFound();
  }

  const logo = imageUrl(brand.logo);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-3 py-8 sm:px-5 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-5">
            {logo ? (
              <Image src={logo} alt={brand.name || 'Brand image'} width={220} height={220} className="h-full w-full object-contain" unoptimized priority />
            ) : (
              <span className="text-5xl font-black text-slate-300">{brand.name?.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Brand</p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">{brand.name}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              {brand.description || `Browse products from ${brand.name}.`}
            </p>
          </div>
        </div>
      </section>

      <BrandProductsClient brand={brand} />
    </main>
  );
}
