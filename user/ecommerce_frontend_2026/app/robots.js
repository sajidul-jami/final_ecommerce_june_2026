import { SITE_URL } from './lib/api';

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
