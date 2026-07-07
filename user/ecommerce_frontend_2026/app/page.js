import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import Categoriesslideber, { CategoryHeroSkeleton } from "./components/Categoriesslideber.js";
import Limitedtimeoffer, { OffersSkeleton } from "./components/Limitedtimeoffer.js";
import Allproducts from "./components/Allproducts.js";
import ProductGridSkeleton from "./components/ProductGridSkeleton.js";
import { getSiteSettings } from './lib/siteSettings';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getCategoryName(categoryCode) {
  if (!API_BASE_URL || !categoryCode) return '';

  try {
    const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!response.ok) return '';
    const categories = await response.json();
    return categories.find((category) => category.cat_code === categoryCode || category.cat_slug === categoryCode)?.name || '';
  } catch {
    return '';
  }
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const category = params?.category || '';
  const settings = await getSiteSettings();

  if (search) {
    return {
      title: `Search results for ${search}`,
      description: `Shop ${search} products in Bangladesh with fast checkout and cash on delivery from ${settings.website_name}.`,
      alternates: { canonical: `/?search=${encodeURIComponent(search)}` },
    };
  }

  if (category) {
    const categoryName = await getCategoryName(category);
    const label = categoryName || category;

    return {
      title: `${label} Products`,
      description: `Browse ${label} products with reliable local delivery in Bangladesh from ${settings.website_name}.`,
      alternates: { canonical: `/?category=${encodeURIComponent(category)}` },
    };
  }

  return {
    title: { absolute: settings.meta_title || settings.website_name },
    description: settings.meta_description || settings.website_description,
    keywords: String(settings.meta_keywords || '').split(',').map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: '/' },
  };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || '';
  const search = params?.search || '';
  const sort = params?.sort || '';

  if (category && !search && !sort) {
    permanentRedirect(`/category/${encodeURIComponent(category)}`);
  }

  return (
    <main>
      <Suspense fallback={<CategoryHeroSkeleton />}>
        <Categoriesslideber />
      </Suspense>
      <Suspense fallback={<OffersSkeleton />}>
        <Limitedtimeoffer />
      </Suspense>
      <Suspense fallback={<section id="shop" className="mx-auto w-full max-w-[1180px] px-2 py-5 sm:px-3 lg:py-6"><ProductGridSkeleton /></section>}>
        <Allproducts search={search} category={category} sort={sort || 'newest'} />
      </Suspense>
    </main>
  );
}
