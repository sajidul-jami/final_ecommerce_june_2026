import { SITE_URL } from '@/app/lib/apiConfig';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/cart', '/user_profile', '/login_signup'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
