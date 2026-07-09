'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import websitelogo from '@/public/images/rupmohol_logo_final.png';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { apiFetch } from '../lib/api';
import { defaultSiteSettings, resolveSiteImage } from '../lib/siteSettings';
import ProductSearchBox from './ProductSearchBox';

export default function Navbar({ settings = defaultSiteSettings }) {
  const { cartItemCount, cartPulseKey } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(null);
  const [brands, setBrands] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showBrands, setShowBrands] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const logoSrc = resolveSiteImage(settings.website_logo) || websitelogo;

  const slugify = (value = '') =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const productHref = (product) => `/product/${encodeURIComponent(product.slug || slugify(product.name) || product.id)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    apiFetch('/brands')
      .then(setBrands)
      .catch(() => setBrands([]));
    apiFetch('/offers')
      .then(setOffers)
      .catch(() => setOffers([]));
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const updateHeaderHeight = () => setHeaderHeight(header.offsetHeight);
    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    if (!cartPulseKey) return undefined;

    setCartBump(true);
    const timer = setTimeout(() => setCartBump(false), 420);
    return () => clearTimeout(timer);
  }, [cartPulseKey]);

  const handleLogoClick = (event) => {
    if (pathname === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header ref={headerRef} className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-2 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-5 lg:py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex min-w-0 items-center gap-2" onClick={handleLogoClick}>
              <Image
                src={logoSrc}
                alt={settings.website_name || 'Website logo'}
                width={140}
                height={56}
                className="h-auto max-h-10 w-24 object-contain sm:w-28 lg:max-h-none"
                priority
                unoptimized={typeof logoSrc === 'string'}
              />
            </Link>

            <div className="min-w-0 flex-1 rounded-xl bg-gradient-to-r from-slate-50 to-white p-1 shadow-sm ring-1 ring-slate-200 lg:hidden">
              <ProductSearchBox
                className="w-full"
                inputClassName="py-2.5 text-[15px]"
                buttonClassName="bg-rose-600 px-3 font-black hover:bg-rose-700"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="hidden min-w-[360px] flex-1 rounded-2xl bg-gradient-to-r from-slate-50 to-white p-1.5 shadow-sm ring-1 ring-slate-200 lg:block xl:min-w-[460px]">
            <ProductSearchBox
              className="w-full"
              inputClassName="py-3 text-[15px]"
              buttonClassName="bg-slate-950 px-6 font-black hover:bg-rose-600"
              placeholder="Search products, brands, categories..."
            />
          </div>

          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            <Link href="/#categories" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white lg:hover:bg-slate-100">
              Categories
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setShowOffers(true)}
              onMouseLeave={() => setShowOffers(false)}
            >
              <button
                type="button"
                onClick={() => setShowOffers((value) => !value)}
                className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-white lg:w-auto lg:hover:bg-slate-100"
              >
                Offers
              </button>
              {showOffers && (
                <div
                  className="absolute left-0 z-50 pt-2"
                >
                  <div className="max-h-96 w-80 overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                    {offers.length ? offers.map((offer) => (
                      <Link
                        key={`${offer.offer_id || 'offer'}-${offer.id}`}
                        href={productHref(offer)}
                        onClick={() => setShowOffers(false)}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-rose-50"
                      >
                        <span className="block text-xs font-black uppercase tracking-wide text-rose-600">
                          {offer.badge_text || offer.offer_title || offer.offer_group || 'Offer'}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block font-semibold text-slate-800">{offer.name}</span>
                      </Link>
                    )) : (
                      <p className="px-3 py-2 text-sm text-slate-500">No active offers</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setShowBrands(true)}
              onMouseLeave={() => setShowBrands(false)}
            >
              <button
                type="button"
                onClick={() => setShowBrands((value) => !value)}
                className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-white lg:w-auto lg:hover:bg-slate-100"
              >
                Brands
              </button>
              {showBrands && (
                <div
                  className="absolute left-0 z-50 pt-2"
                >
                  <div className="max-h-72 w-56 overflow-auto rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                    {brands.length ? brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brand/${brand.slug}`}
                        onClick={() => {
                          setShowBrands(false);
                        }}
                        className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-rose-600"
                      >
                        {brand.name}
                      </Link>
                    )) : (
                      <p className="px-4 py-2 text-sm text-slate-500">No active brands</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/help_support" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white lg:hover:bg-slate-100">
              Support
            </Link>
            <Link
              href="/cart"
              className={`hidden rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 lg:inline-flex ${cartBump ? 'cart-bump' : ''}`}
            >
              Cart ({mounted ? cartItemCount : 0})
            </Link>

            {!mounted ? (
              <span className="h-10 w-16 rounded-md bg-slate-100" aria-hidden="true" />
            ) : user ? (
              <div className="relative col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => setShowUserDetails((value) => !value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:border-slate-950 lg:w-auto"
                >
                  {user.user_name || user.phone_number || 'Account'}
                </button>

                {showUserDetails && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-xl">
                    <p className="truncate text-sm font-semibold">{user.full_name || user.user_name || 'Customer'}</p>
                    <p className="truncate text-xs text-slate-500">{user.phone_number}</p>
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/user_profile');
                        setShowUserDetails(false);
                      }}
                      className="mt-3 w-full rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200"
                    >
                      Profile & Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserDetails(false);
                        router.push('/');
                      }}
                      className="mt-2 w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login_signup/login" className="rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>
      <div
        aria-hidden="true"
        className="h-[64px] sm:h-[66px] lg:h-[73px]"
        style={headerHeight ? { height: `${headerHeight}px` } : undefined}
      />
    </>
  );
}
