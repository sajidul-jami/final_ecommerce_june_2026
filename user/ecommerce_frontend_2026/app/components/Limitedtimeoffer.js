'use client';

import { useEffect, useState } from 'react';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';
import { apiFetch } from '@/app/lib/api';

export default function Limitedtimeoffer() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const dynamicOffers = await apiFetch('/offers');
        setOffers(dynamicOffers.length ? dynamicOffers : await getAllProducts({ limit: 5 }));
      } catch (error) {
        try {
          setOffers(await getAllProducts({ limit: 5 }));
        } catch (fallbackError) {
          console.error(error, fallbackError);
        }
      }
    };

    fetchOffers();
  }, []);

  return (
    <section id="offers" className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Fresh deals</p>
          <h2 className="text-2xl font-bold text-slate-950">Offers & Deals</h2>
          <p className="mt-1 text-sm text-slate-500">Admin-managed products and campaign deals.</p>
        </div>
      </div>
      <Cards products={offers} />
    </section>
  );
}
