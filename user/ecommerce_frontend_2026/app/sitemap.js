import { API_BASE_URL, SITE_URL } from '@/app/lib/apiConfig';

async function safeApi(path) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const [products, categories] = await Promise.all([
    safeApi('/products?limit=60'),
    safeApi('/categories'),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${SITE_URL}/?category=${encodeURIComponent(category.cat_code || category.cat_slug || category.id)}`,
      lastModified: category.created_at ? new Date(category.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/singleproduct/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
