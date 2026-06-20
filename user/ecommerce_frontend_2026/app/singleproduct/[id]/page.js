import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PRODUCT_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL;

if (!PRODUCT_IMAGE_BASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL environment variable');
}

async function getProduct(id, countView = false) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/singleproducts/${id}${countView ? '' : '?view=0'}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const productImageUrl = (photo) =>
  photo ? `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${photo}` : undefined;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id, false);

  if (!product) {
    return {
      title: 'Product not found',
      description: 'The requested TechTrends BD product could not be found.',
    };
  }

  const description = stripHtml(product.description).slice(0, 155)
    || `Buy ${product.name} from TechTrends BD with fast checkout and local delivery in Bangladesh.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/singleproduct/${id}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: productImageUrl(product.photo) ? [productImageUrl(product.photo)] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id, true);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description),
    sku: product.sku || `TTBD-${product.id}`,
    image: productImageUrl(product.photo),
    category: product.category_name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: Number(product.price || 0),
      availability: Number(product.quantity || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}
