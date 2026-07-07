'use client';

import { useEffect, useState } from 'react';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';

const PAGE_SIZE = 12;

export default function BrandProductsClient({ brand }) {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const rows = await getAllProducts({
          brand: brand.slug,
          sort,
          limit: PAGE_SIZE + 1,
          offset: (page - 1) * PAGE_SIZE,
        });

        setProducts(rows.slice(0, PAGE_SIZE));
        setHasMore(rows.length > PAGE_SIZE);
      } catch {
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [brand.slug, page, sort]);

  const changeSort = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-black text-slate-950">{brand.name} Products</h2>
        <select
          value={sort}
          onChange={changeSort}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-950"
        >
          <option value="newest">Newest</option>
          <option value="best_selling">Best selling</option>
          <option value="name_asc">A-Z</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm">Loading products...</div>
      ) : (
        <>
          <Cards products={products} />
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-slate-600">Page {page}</span>
            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
