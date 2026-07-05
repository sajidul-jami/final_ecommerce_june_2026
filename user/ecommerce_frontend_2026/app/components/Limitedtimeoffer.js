'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import Cards from '@/app/components/cards';

export default function Limitedtimeoffer() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setOffers(await apiFetch('/offers'));
      } catch (error) {
        console.error(error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const groupedOffers = offers.reduce((groups, offer) => {
    const title = offer.offer_group || offer.offer_title || 'Special Offers';
    groups[title] = [...(groups[title] || []), offer];
    return groups;
  }, {});
  const groupEntries = Object.entries(groupedOffers);

  if (!loading && groupEntries.length === 0) {
    return null;
  }

  return (
    <section id="offers" className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-950">Offers & Deals</h2>
      </div>
      {loading ? (
        <div className="rounded-md bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading offers...</div>
      ) : (
        <div className="space-y-7">
          {groupEntries.map(([title, products]) => (
            <div key={title}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <span className="text-sm font-semibold text-rose-600">{products.length} deals</span>
              </div>
              <Cards products={products} layout="scroll" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
