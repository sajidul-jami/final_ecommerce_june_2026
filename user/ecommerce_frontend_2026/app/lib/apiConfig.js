const trimSlash = (value = '') => value.replace(/\/$/, '');

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const API_BASE_URL = trimSlash(requireEnv('NEXT_PUBLIC_API_BASE_URL'));
export const PRODUCT_IMAGE_BASE_URL = trimSlash(requireEnv('NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL'));
export const SITE_URL = trimSlash(requireEnv('NEXT_PUBLIC_SITE_URL'));

export function getProductImageSrc(photo) {
  const imageName = photo || 'noimage.jpg';

  if (/^https?:\/\//i.test(imageName) || imageName.startsWith('/')) {
    return imageName;
  }

  return `${PRODUCT_IMAGE_BASE_URL}/${imageName}`;
}
