'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const iconClassName = 'h-5 w-5';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const categoryHref = (category) =>
  `/category/${encodeURIComponent(category.cat_slug || category.cat_code || slugify(category.name))}`;

const getCategoryCode = (category) => String(category.cat_code || category.code || slugify(category.name));

const getParentCodeFromPath = (code) => {
  const parts = String(code || '').split('-').filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('-');
};

const buildCategoryTree = (items = []) => {
  const byCode = new Map(
    items.map((category) => {
      const code = getCategoryCode(category);
      return [code, { ...category, cat_code: code, children: [] }];
    })
  );
  const roots = [];

  items.forEach((category) => {
    const code = getCategoryCode(category);
    const parentCode = category.parent_code || getParentCodeFromPath(code);
    const node = byCode.get(code);

    if (parentCode && byCode.has(parentCode)) {
      byCode.get(parentCode).children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
};

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

  if (name === 'type') {
    return <svg {...common}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>;
  }

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

  if (name === 'support') {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 0 1 5 1.4c0 2-2.5 2.1-2.5 3.8" /><path d="M12 17h.01" /></svg>;
  }

  if (name === 'brands') {
    return <svg {...common}><path d="M20.6 13.5 13.5 20.6a2 2 0 0 1-2.8 0L3.4 13.3a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h6.9a2 2 0 0 1 1.4.6l7.5 7.5a2 2 0 0 1 0 2.8Z" /><path d="M7.5 7.5h.01" /></svg>;
  }

  return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
}

function Drawer({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-[58] bg-slate-950/35 lg:hidden"
      />
      <section className="fixed inset-x-2 bottom-[4.6rem] z-[60] max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl lg:hidden">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <h2 className="text-base font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-lg font-black">
            x
          </button>
        </div>
        <div className="max-h-[calc(70vh-3.5rem)] overflow-y-auto p-3">
          {children}
        </div>
      </section>
    </>
  );
}

function NavButton({ label, icon, active, badge, center, pulse, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-black transition ${
        center
          ? `-mt-6 h-[4.4rem] max-w-[4.6rem] rounded-2xl text-white shadow-xl ${pulse ? 'cart-bump bg-red-600 shadow-red-500/40' : 'bg-slate-950'}`
          : `h-14 ${active ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`
      }`}
    >
      <Icon name={icon} />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className={`absolute grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] leading-none text-white ${
          center ? '-right-1 top-1 bg-red-600 ring-2 ring-white' : 'right-2 top-1 bg-rose-600'
        } ${pulse ? 'cart-bump scale-125' : ''}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function DrawerLink({ href, icon, title, subtitle, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-rose-200 hover:bg-rose-50">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
        <Icon name={icon} />
      </span>
      <span className="min-w-0">
        <span className="block font-black">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{subtitle}</span>}
      </span>
    </Link>
  );
}

function CategoryTreeItem({ category, depth = 0, onSelect }) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children?.length > 0;

  return (
    <div className={depth > 0 ? 'ml-3 border-l border-slate-100 pl-2' : ''}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1.5">
        <Link
          href={categoryHref(category)}
          onClick={onSelect}
          className="min-w-0 flex-1 truncate px-2 py-2 text-sm font-black text-slate-800"
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-lg font-black text-rose-600 shadow-sm"
            aria-label={`${open ? 'Hide' : 'Show'} ${category.name} subcategories`}
            aria-expanded={open}
          >
            {open ? '-' : '+'}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div className="mt-2 grid gap-2">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id || child.cat_code || child.name}
              category={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItemCount, cartPulseKey } = useCart();
  const { user } = useUser();
  const [activeDrawer, setActiveDrawer] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [offers, setOffers] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/categories').catch(() => []),
      apiFetch('/brands').catch(() => []),
      apiFetch('/offers').catch(() => []),
    ]).then(([categoryRows, brandRows, offerRows]) => {
      setCategories(Array.isArray(categoryRows) ? categoryRows : []);
      setBrands(Array.isArray(brandRows) ? brandRows : []);
      setOffers(Array.isArray(offerRows) ? offerRows : []);
    });
  }, []);

  useEffect(() => {
    if (!cartPulseKey) return undefined;
    setCartPulse(true);
    const timer = setTimeout(() => setCartPulse(false), 900);
    return () => clearTimeout(timer);
  }, [cartPulseKey]);

  useEffect(() => {
    setActiveDrawer('');
  }, [pathname]);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const visibleBrands = useMemo(() => brands.filter((brand) => brand.status !== 'Inactive').slice(0, 12), [brands]);

  const productHref = (product) => `/product/${encodeURIComponent(product.slug || slugify(product.name) || product.id)}`;

  return (
    <>
      <Drawer title="Type" open={activeDrawer === 'type'} onClose={() => setActiveDrawer('')}>
        <div className="grid gap-2">
          <DrawerLink href="/" icon="home" title="Home" subtitle="Go to homepage" onClick={() => setActiveDrawer('')} />
          <DrawerLink href="/brands" icon="brands" title="Brands" subtitle="Shop by brand" onClick={() => setActiveDrawer('')} />
          <DrawerLink href="/help_support" icon="support" title="Support" subtitle="Need help? Contact us" onClick={() => setActiveDrawer('')} />
        </div>
        {visibleBrands.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Popular brands</p>
            <div className="grid grid-cols-2 gap-2">
              {visibleBrands.map((brand) => (
                <Link
                  key={brand.id || brand.slug || brand.name}
                  href={`/brand/${brand.slug || slugify(brand.name)}`}
                  onClick={() => setActiveDrawer('')}
                  className="truncate rounded-lg border border-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:border-rose-200 hover:text-rose-600"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      <Drawer title="Categories" open={activeDrawer === 'categories'} onClose={() => setActiveDrawer('')}>
        {categoryTree.length ? (
          <div className="grid gap-2">
            {categoryTree.map((category) => (
              <CategoryTreeItem
                key={category.id || category.cat_code || category.name}
                category={category}
                onSelect={() => setActiveDrawer('')}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No categories added yet.</p>
        )}
      </Drawer>

      <Drawer title="Active Offers" open={activeDrawer === 'offers'} onClose={() => setActiveDrawer('')}>
        {offers.length ? (
          <div className="grid gap-2">
            {offers.map((offer) => (
              <Link
                key={`${offer.offer_id || 'offer'}-${offer.id}`}
                href={productHref(offer)}
                onClick={() => setActiveDrawer('')}
                className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-slate-950 transition hover:border-rose-300 hover:bg-white"
              >
                <span className="block text-xs font-black uppercase tracking-wide text-rose-600">
                  {offer.badge_text || offer.offer_title || offer.offer_group || 'Offer'}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm font-black">{offer.name}</span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {offer.discount_type === 'Percentage' ? `${offer.discount_value}% off` : `৳${Number(offer.discount_value || 0)} off`}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No active offers right now.</p>
        )}
      </Drawer>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.14)] backdrop-blur lg:hidden" aria-label="Mobile quick navigation">
        <div className="mx-auto flex max-w-md items-end gap-1">
          <NavButton label="Type" icon="type" active={activeDrawer === 'type'} onClick={() => setActiveDrawer(activeDrawer === 'type' ? '' : 'type')} />
          <NavButton label="Category" icon="categories" active={activeDrawer === 'categories' || pathname.startsWith('/category')} onClick={() => setActiveDrawer(activeDrawer === 'categories' ? '' : 'categories')} />
          <NavButton label="Cart" icon="cart" center active={pathname === '/cart'} badge={cartItemCount} pulse={cartPulse} onClick={() => { window.location.href = '/cart'; }} />
          <NavButton label="Offers" icon="offers" active={activeDrawer === 'offers'} onClick={() => setActiveDrawer(activeDrawer === 'offers' ? '' : 'offers')} />
          <NavButton label="Account" icon="account" active={pathname === '/user_profile'} onClick={() => { window.location.href = user ? '/user_profile' : '/login_signup/login'; }} />
        </div>
      </nav>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  );
}
