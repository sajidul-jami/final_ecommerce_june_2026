'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/lib/api';
import ProductImage from './ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

const fetchSearchSuggestions = async (query) => {
  const suggestionUrl = `${API_BASE_URL}/search-suggestions?q=${encodeURIComponent(query)}&limit=8`;
  const suggestionResponse = await fetch(suggestionUrl);

  if (suggestionResponse.ok) {
    return suggestionResponse.json();
  }

  const fallbackUrl = `${API_BASE_URL}/products?search=${encodeURIComponent(query)}&limit=8`;
  const fallbackResponse = await fetch(fallbackUrl);

  if (!fallbackResponse.ok) {
    return [];
  }

  return fallbackResponse.json();
};

export default function ProductSearchBox({
  className = '',
  inputClassName = '',
  buttonClassName = '',
  placeholder = 'Search products',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const closeTimer = useRef(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const rows = await fetchSearchSuggestions(query);
        if (active) {
          setSuggestions(rows);
          setOpen(true);
        }
      } catch (error) {
        if (active) setSuggestions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const query = search.trim();

    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }

    setOpen(false);
    router.push(params.toString() ? `/?${params.toString()}#shop` : '/#shop');
  };

  const openProduct = (id) => {
    setOpen(false);
    router.push(`/singleproduct/${id}`);
  };

  const handleBlur = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  const handleFocus = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (search.trim().length >= 2) setOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={submitSearch} className="flex w-full overflow-hidden rounded-md border border-slate-300 bg-white">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={`min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none ${inputClassName}`}
        />
        <button
          type="submit"
          className={`px-4 py-2 text-sm font-semibold text-white transition ${buttonClassName || 'bg-rose-600 hover:bg-rose-700'}`}
        >
          Search
        </button>
      </form>

      {open && (loading || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xl">
          {loading && suggestions.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-500">Searching...</div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openProduct(item.id)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-rose-50"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  <ProductImage
                    photo={item.photo}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{item.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{item.category_name || item.brand_name || 'Product'}</span>
                    {item.matched_tag && <span className="text-rose-600">Tag: {item.matched_tag}</span>}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-rose-600">{taka.format(item.price)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
