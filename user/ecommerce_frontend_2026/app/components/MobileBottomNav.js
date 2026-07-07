'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const hiddenPrefixes = [
  '/product/',
  '/singleproduct/',
  '/cart',
  '/checkout',
  '/login_signup',
];

const iconClassName = 'h-5 w-5';

function Icon({ name }) {
  const common = {
    className: iconClassName,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'home') {
    return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>;
  }

  if (name === 'categories') {
    return <svg {...common}><path d="M4 5h7v7H4z" /><path d="M13 5h7v7h-7z" /><path d="M4 14h7v5H4z" /><path d="M13 14h7v5h-7z" /></svg>;
  }

  if (name === 'offers') {
    return <svg {...common}><path d="M20 12v7a1 1 0 0 1-1 1h-7" /><path d="M4 12v7a1 1 0 0 0 1 1h7" /><path d="M4 8h16v4H4z" /><path d="M12 8v12" /><path d="M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8z" /><path d="M12 8h3.5A2.5 2.5 0 1 0 13 5.5V8z" /></svg>;
  }

  if (name === 'cart') {
    return <svg {...common}><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.5L21 8H6" /></svg>;
  }

  if (name === 'account') {
    return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  }

  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>;
}

function socialIcon(platform = '') {
  const name = platform.toLowerCase();
  if (name.includes('facebook')) return 'f';
  if (name.includes('whatsapp')) return 'wa';
  if (name.includes('instagram')) return 'ig';
  if (name.includes('youtube')) return 'yt';
  if (name.includes('telegram')) return 'tg';
  if (name.includes('linkedin')) return 'in';
  if (name.includes('twitter') || name === 'x') return 'x';
  return platform.slice(0, 2).toUpperCase();
}

function NavItem({ href, label, icon, active, badge }) {
  return (
    <Link
      href={href}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 text-[11px] font-black transition ${
        active ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <Icon name={icon} />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className="absolute right-3 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] leading-none text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function ClickableNavItem({ href, label, icon, active, badge, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 text-[11px] font-black transition ${
        active ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <Icon name={icon} />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className="absolute right-3 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] leading-none text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const { user } = useUser();
  const [socialLinks, setSocialLinks] = useState([]);
  const shouldHide = hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));

  useEffect(() => {
    apiFetch('/social-links')
      .then((links) => setSocialLinks(Array.isArray(links) ? links.slice(0, 3) : []))
      .catch(() => setSocialLinks([]));
  }, []);

  if (shouldHide) return null;

  return (
    <>
      {socialLinks.length > 0 && (
        <div className="fixed bottom-[4.35rem] right-2 z-50 flex flex-col gap-2 lg:hidden">
          {socialLinks.map((link) => (
            <a
              key={link.id || link.platform}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.platform}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[11px] font-black uppercase text-slate-700 shadow-lg transition hover:bg-rose-600 hover:text-white"
            >
              {socialIcon(link.platform)}
            </a>
          ))}
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden" aria-label="Mobile quick navigation">
        <div className="mx-auto flex max-w-md items-center gap-1">
          <NavItem href="/" label="Home" icon="home" active={pathname === '/'} />
          <ClickableNavItem href="/#categories" label="Categories" icon="categories" active={pathname.startsWith('/category')} onClick={(event) => {
            if (pathname !== '/') return;
            const target = document.querySelector('#categories');
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', '#categories');
          }} />
          <ClickableNavItem href="/#offers" label="Offers" icon="offers" onClick={(event) => {
            if (pathname !== '/') return;
            const target = document.querySelector('#offers');
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', '#offers');
          }} />
          <NavItem href="/cart" label="Cart" icon="cart" active={pathname === '/cart'} badge={cartItemCount} />
          <NavItem href={user ? '/user_profile' : '/login_signup/login'} label="Account" icon="account" active={pathname === '/user_profile'} />
        </div>
      </nav>
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </>
  );
}
