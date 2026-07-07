import Link from 'next/link';
import Image from 'next/image';
import SocialLinks from './SocialLinks';
import { defaultSiteSettings, resolveSiteImage } from '../lib/siteSettings';

export default function Footer({ settings = defaultSiteSettings }) {
  const footerLogo = resolveSiteImage(settings.footer_logo || settings.website_logo);
  const footerLinks = String(settings.footer_quick_links || '')
    .split('\n')
    .map((line) => {
      const [label, href] = line.split('|').map((part) => part?.trim());
      return label && href ? { label, href } : null;
    })
    .filter(Boolean);

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-6 px-3 py-8 sm:px-5 md:grid-cols-[1fr_1fr_1fr]">
        <div>
          {footerLogo ? (
            <Image src={footerLogo} alt={settings.website_name || 'Website logo'} width={160} height={64} className="h-auto max-h-16 w-auto object-contain" unoptimized />
          ) : (
            <h2 className="text-lg font-black text-slate-950">{settings.footer_title || settings.website_name}</h2>
          )}
          <p className="mt-2 max-w-md text-sm leading-6">
            {settings.footer_description || settings.website_description}
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-black text-slate-950">Contact Info</h3>
          {settings.phone && <p className="mt-2">Phone: {settings.phone}</p>}
          {settings.whatsapp && <p className="mt-1">WhatsApp: {settings.whatsapp}</p>}
          {settings.contact_email && <p className="mt-1">Email: {settings.contact_email}</p>}
          {settings.support_email && settings.support_email !== settings.contact_email && <p className="mt-1">Support: {settings.support_email}</p>}
          {settings.office_address && <p className="mt-1">Address: {settings.office_address}</p>}
          {settings.google_map && (
            <a href={settings.google_map} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold text-rose-600 hover:text-slate-950">
              Google Map
            </a>
          )}
          <Link href="/help_support" className="mt-3 inline-block font-bold text-rose-600 hover:text-slate-950">
            Help & Support
          </Link>
          <SocialLinks />
        </div>
        <div className="text-sm md:justify-self-end">
          <h3 className="font-black text-slate-950">Footer Links</h3>
          <div className="mt-3 grid gap-2">
            {footerLinks.length ? footerLinks.map((item) => (
              <Link key={`${item.label}-${item.href}`} href={item.href} className="font-semibold text-slate-600 hover:text-rose-600">
                {item.label}
              </Link>
            )) : (
              <Link href="/help_support" className="font-semibold text-slate-600 hover:text-rose-600">
                Help & Support
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 px-3 py-4 text-center text-xs sm:px-5">
        {settings.footer_copyright}
      </div>
    </footer>
  );
}
