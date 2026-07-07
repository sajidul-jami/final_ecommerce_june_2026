import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/app/lib/api';
import CategoryProductsClient from './CategoryProductsClient';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function getCategory(slug) {
  if (!API_BASE_URL) return null;

  const decodedSlug = decodeURIComponent(String(slug || ''));

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(decodedSlug)}`, {
      cache: 'no-store',
    });

    if (response.ok) return response.json();
  } catch {
    // Fall through to the all-categories fallback below.
  }

  try {
    const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!response.ok) return null;

    const categories = await response.json();
    const normalizedSlug = slugify(decodedSlug);
    const normalizedName = decodedSlug.replace(/-/g, ' ').toLowerCase().trim();

    return categories.find((category) =>
      String(category.cat_slug || '') === decodedSlug
      || String(category.cat_code || '') === decodedSlug
      || String(category.cat_slug || '') === normalizedSlug
      || slugify(category.name) === normalizedSlug
      || String(category.name || '').toLowerCase().trim() === normalizedName
    ) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category not found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} Products`,
    description: `Browse ${category.name} products with fast checkout and local delivery.`,
    alternates: { canonical: `/category/${category.cat_slug || category.cat_code}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Category</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{category.name}</h1>
        </div>
      </section>
      <CategoryProductsClient category={category} />
    </main>
  );
}
