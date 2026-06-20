export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';

export const PRODUCT_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || 'http://localhost:9000/products/images/productsimg';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
