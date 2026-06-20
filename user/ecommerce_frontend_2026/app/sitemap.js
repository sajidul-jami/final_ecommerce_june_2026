const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function safeApi(path) {
  if (!API_BASE_URL) return [];

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const [products, categories] = await Promise.all([
    safeApi('/products?limit=60'),
    safeApi('/categories'),
  ]);

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${siteUrl}/?category=${encodeURIComponent(category.cat_code || category.cat_slug || category.id)}`,
      lastModified: category.created_at ? new Date(category.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/singleproduct/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
