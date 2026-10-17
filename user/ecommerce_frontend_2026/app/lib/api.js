export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';

export const PRODUCT_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || 'http://localhost:9000/ecommerce';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const PRODUCT_CACHE_TAG = 'products';
export const PRODUCT_LIST_CACHE_TAG = 'product-list';
export const PRODUCT_CACHE_SECONDS = 300;

export async function apiFetch(path, options = {}) {
  const isProductList = path === '/products' || path.startsWith('/products?');
  const cacheOptions = isProductList
    ? { next: { revalidate: PRODUCT_CACHE_SECONDS, tags: [PRODUCT_CACHE_TAG, PRODUCT_LIST_CACHE_TAG] } }
    : {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...cacheOptions,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }

  return data;
}
