import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/app/lib/api';

async function getCmsPage(slug) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/cms-pages/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  if (!page) {
    return {
      title: 'Page not found',
      description: 'The requested page could not be found.',
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || stripHtml(page.content).slice(0, 155),
    keywords: page.meta_keywords || undefined,
    alternates: { canonical: `/page/${page.slug}` },
  };
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-8 text-slate-950 sm:px-5">
      <article className="mx-auto max-w-4xl rounded-lg bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-3xl font-black sm:text-5xl">{page.title}</h1>
        <div
          className="mt-6 space-y-4 leading-7 text-slate-700"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
      </article>
    </main>
  );
}
