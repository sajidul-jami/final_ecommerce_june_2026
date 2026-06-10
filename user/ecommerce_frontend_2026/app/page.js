import { Suspense } from "react";
import Categoriesslideber from "./components/Categoriesslideber.js";
import Limitedtimeoffer from "./components/Limitedtimeoffer.js";
import Allproducts from "./components/Allproducts.js";

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

  if (search) {
    return {
      title: `Search results for ${search}`,
      description: `Shop ${search} products in Bangladesh with fast checkout and cash on delivery from TechTrends BD.`,
      alternates: { canonical: `/?search=${encodeURIComponent(search)}` },
    };
  }

  if (category) {
    const categoryName = await getCategoryName(category);
    const label = categoryName || category;

    return {
      title: `${label} Products`,
      description: `Browse ${label} products with reliable local delivery in Bangladesh from TechTrends BD.`,
      alternates: { canonical: `/?category=${encodeURIComponent(category)}` },
    };
  }

  return {
    title: { absolute: 'TechTrends BD - Quality Tech Products in Bangladesh' },
    description: 'Shop laptops, tablets, phones, gaming PCs and accessories in Bangladesh with fast checkout and cash on delivery.',
    alternates: { canonical: '/' },
  };
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={null}>
        <Categoriesslideber />
      </Suspense>
      <Limitedtimeoffer />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-3 py-6 text-slate-500 sm:px-5">Loading products...</div>}>
        <Allproducts />
      </Suspense>
    </main>
  );
}
