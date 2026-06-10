'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import websitelogo from '@/public/images/websitelogo.jpeg';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { cartItemCount } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSearch(searchParams.get('search') || '');
  }, [mounted, searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    const target = params.toString() ? `/?${params.toString()}#shop` : '/#shop';
    router.push(target);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src={websitelogo} alt="TechTrends logo" className="h-12 w-28 rounded-md object-cover" priority />
            <span className="hidden text-lg font-bold text-slate-950 sm:block">TechTrends BD</span>
          </Link>
          <Link
            href="/cart"
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white lg:hidden"
          >
            Cart {mounted ? cartItemCount : 0}
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex w-full overflow-hidden rounded-md border border-slate-300 lg:max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search laptops, tablets, phones"
            className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none"
          />
          <button type="submit" className="bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/#categories" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Categories
          </Link>
          <Link href="/#offers" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Offers
          </Link>
          <Link href="/help_support" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Support
          </Link>
          <Link
            href="/cart"
            className="hidden rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 lg:inline-flex"
          >
            Cart ({mounted ? cartItemCount : 0})
          </Link>

          {!mounted ? (
            <span className="h-10 w-16 rounded-md bg-slate-100" aria-hidden="true" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDetails((value) => !value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:border-slate-950"
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
            <Link href="/login_signup/login" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
