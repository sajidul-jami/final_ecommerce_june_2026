import { notFound, permanentRedirect } from 'next/navigation';
import { API_BASE_URL } from '@/app/lib/api';

async function getProduct(id, countView = false) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/singleproducts/${id}${countView ? '' : '?view=0'}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id, false);

  if (!product) {
    return {
      title: 'Product not found',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: product.name,
    alternates: { canonical: `/product/${product.slug || id}` },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id, true);

  if (!product) {
    notFound();
  }

  permanentRedirect(`/product/${product.slug || product.id}`);
}
