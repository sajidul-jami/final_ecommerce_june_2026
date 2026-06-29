import Link from 'next/link';
import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-6 px-3 py-8 sm:px-5 md:grid-cols-[1fr_1fr_1fr]">
        <div>
          <h2 className="text-lg font-black text-slate-950">TechTrends BD</h2>
          <p className="mt-2 max-w-md text-sm leading-6">
            Trusted tech products in Bangladesh with fast ordering, clear stock and easy payment options.
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-black text-slate-950">Contact Info</h3>
          <p className="mt-2">Phone: +880 1700-000000</p>
          <p className="mt-1">Email: support@techtrendsbd.com</p>
          <p className="mt-1">Address: Dhaka, Bangladesh</p>
          <Link href="/help_support" className="mt-3 inline-block font-bold text-rose-600 hover:text-slate-950">
            Help & Support
          </Link>
          <SocialLinks />
        </div>
        <form className="flex flex-col gap-2 sm:flex-row md:justify-end">
          <input
            type="email"
            placeholder="Your email address"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950"
          />
          <button type="button" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">
            Subscribe
          </button>
        </form>
      </div>
      <div className="border-t border-slate-200 px-3 py-4 text-center text-xs sm:px-5">
        Copyright 2026 TechTrendsBD.com. All rights reserved.
      </div>
    </footer>
  );
}
