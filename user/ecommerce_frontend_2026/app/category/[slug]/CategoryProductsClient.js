'use client';

import { useEffect, useState } from 'react';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';

const PAGE_SIZE = 12;

export default function CategoryProductsClient({ category }) {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await getAllProducts({
          ...(category.tag ? { tag: category.tag } : { category: category.cat_slug || category.cat_code }),
          sort,
          limit: PAGE_SIZE + 1,
          offset: (page - 1) * PAGE_SIZE,
          include_count: 1,
        });
        const rows = Array.isArray(result) ? result : result.products || [];
        const total = Array.isArray(result) ? ((page - 1) * PAGE_SIZE) + rows.length : Number(result.total || 0);

        setProducts(rows.slice(0, PAGE_SIZE));
        setHasMore(rows.length > PAGE_SIZE);
        setTotalProducts(total);
      } catch {
        setProducts([]);
        setHasMore(false);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category.cat_code, category.cat_slug, category.tag, page, sort]);

  const changeSort = (event) => {
    setSort(event.target.value);
    setPage(1);
  };
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const startProduct = totalProducts ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endProduct = totalProducts ? Math.min(page * PAGE_SIZE, totalProducts) : 0;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-2 py-5 sm:px-3 lg:py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">{category.name} Products</h2>
          {!loading && (
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {totalProducts > 0
                ? `Showing ${startProduct}-${endProduct} of ${totalProducts} products`
                : 'No products found in this category'}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {!loading && totalProducts > 0 && (
            <span className="text-sm font-bold text-slate-600">Page {page} of {totalPages}</span>
          )}
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
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm">Loading products...</div>
      ) : (
        <>
          <Cards products={products} />
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              Previous
            </button>
            <span className="text-sm font-bold text-slate-600">Page {page} of {totalPages}</span>
            <button type="button" disabled={!hasMore} onClick={() => setPage((value) => value + 1)} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
