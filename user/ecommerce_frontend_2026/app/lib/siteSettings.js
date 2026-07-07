import { API_BASE_URL, PRODUCT_IMAGE_BASE_URL, SITE_URL } from './api';

export const defaultSiteSettings = {
  website_name: 'TechTrends BD',
  website_logo: '',
  footer_logo: '',
  favicon: '',
  website_description: 'Quality tech products in Bangladesh with fast checkout and cash on delivery.',
  footer_title: '',
  footer_description: '',
  footer_quick_links: 'Shop | /\nHelp & Support | /help_support\nCart | /cart',
  contact_email: 'support@techtrendsbd.com',
  phone: '+880 1700-000000',
  whatsapp: '',
  office_address: 'Dhaka, Bangladesh',
  google_map: '',
  support_email: 'support@techtrendsbd.com',
  footer_copyright: `Copyright ${new Date().getFullYear()} TechTrendsBD.com. All rights reserved.`,
  meta_title: 'TechTrends BD - Quality Tech Products in Bangladesh',
  meta_description: 'Quality tech products in Bangladesh with fast checkout and cash on delivery.',
  meta_keywords: 'tech products Bangladesh, laptops, mobile phones, tablets, gaming PC, TechTrends BD',
  google_analytics: '',
  google_tag_manager: '',
  facebook_pixel: '',
  inside_dhaka_delivery_charge: 80,
  outside_dhaka_delivery_charge: 120
};

export async function getSiteSettings() {
  if (!API_BASE_URL) return defaultSiteSettings;

  try {
    const response = await fetch(`${API_BASE_URL}/site-settings`, { cache: 'no-store' });
    if (!response.ok) return defaultSiteSettings;
    const data = await response.json();
    return { ...defaultSiteSettings, ...data };
  } catch {
    return defaultSiteSettings;
  }
}

export const resolveSiteImage = (value = '') => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${value}`;
};

export const siteUrl = SITE_URL;
