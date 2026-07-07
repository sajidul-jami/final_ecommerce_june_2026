import CategoryProductsClient from '@/app/category/[slug]/CategoryProductsClient';

const tagName = (slug = '') =>
  String(slug)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const name = tagName(slug);

  return {
    title: `${name} Products`,
    description: `Browse products tagged ${name}.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params }) {
  const { slug } = await params;
  const name = tagName(slug);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Tag</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{name}</h1>
        </div>
      </section>
      <CategoryProductsClient category={{ name, cat_slug: '', cat_code: '', tag: slug }} />
    </main>
  );
}
