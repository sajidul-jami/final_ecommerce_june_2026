import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/app/singleproduct/[id]/ProductDetailsClient';
import { API_BASE_URL, PRODUCT_IMAGE_BASE_URL } from '@/app/lib/api';
import { getSiteSettings } from '@/app/lib/siteSettings';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function fetchApi(path) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

async function findProductBySlugFallback(slug) {
  const searchText = String(slug).replace(/-/g, ' ').trim();
  const searches = [
    `/products?search=${encodeURIComponent(searchText)}&limit=60`,
    '/products?limit=60',
  ];

  for (const path of searches) {
    const products = await fetchApi(path);
    if (!Array.isArray(products)) continue;

    const match = products.find((product) =>
      String(product.slug || '') === slug
      || slugify(product.name) === slug
      || String(product.id) === slug
    );

    if (match?.id) {
      return fetchApi(`/singleproducts/${encodeURIComponent(match.id)}?view=0`);
    }
  }

  return null;
}

async function getProduct(slug) {
  const product = await fetchApi(`/product/${encodeURIComponent(slug)}`);
  if (product) return product;
  return findProductBySlugFallback(slug);
}

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const productImageUrl = (photo) =>
  photo ? `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${photo}` : undefined;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product not found',
      description: `The requested ${settings.website_name} product could not be found.`,
    };
  }

  const description = stripHtml(product.description).slice(0, 155)
    || `Buy ${product.name} from ${settings.website_name} with fast checkout and local delivery in Bangladesh.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug || slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: productImageUrl(product.photo) ? [productImageUrl(product.photo)] : [],
    },
  };
}

export default async function ProductSlugPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

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
