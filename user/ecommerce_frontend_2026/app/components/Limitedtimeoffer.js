'use client';

import { useEffect, useState } from 'react';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';

export default function Limitedtimeoffer() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setOffers(await getAllProducts({ limit: 5 }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchOffers();
  }, []);

  return (
    <section id="offers" className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Fresh deals</p>
          <h2 className="text-2xl font-bold text-slate-950">Limited Time Offers</h2>
        </div>
      </div>
      <Cards products={offers} />
    </section>
  );
}
