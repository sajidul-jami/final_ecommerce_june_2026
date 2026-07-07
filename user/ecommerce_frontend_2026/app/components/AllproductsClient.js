'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Cards from '@/app/components/cards';
import ProductGridSkeleton from '@/app/components/ProductGridSkeleton';
import getAllProducts from '@/app/lib/mysqldb';
import { apiFetch } from '@/app/lib/api';

export default function AllproductsClient({
  initialProducts = [],
  initialCategoryName = '',
  initialHasMore = false,
  initialSearch = '',
  initialCategory = '',
  initialSort = 'newest',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [categoryName, setCategoryName] = useState(initialCategoryName);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const querySort = searchParams.get('sort') || 'newest';
  const isInitialQuery =
    querySearch === initialSearch
    && queryCategory === initialCategory
    && querySort === initialSort;

  useEffect(() => {
    if (isInitialQuery) return undefined;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productRows, categoryRows] = await Promise.all([
          getAllProducts({
            ...(queryCategory ? { category: queryCategory } : {}),
            ...(querySearch ? { search: querySearch } : {}),
            ...(querySort !== 'newest' ? { sort: querySort } : {}),
            limit: 11,
          }),
          queryCategory ? apiFetch('/categories') : Promise.resolve([]),
        ]);
        const activeCategory = categoryRows.find((item) => item.cat_code === queryCategory || item.cat_slug === queryCategory);

        setProducts(productRows.slice(0, 10));
        setHasMore(productRows.length > 10);
        setCategoryName(activeCategory?.name || '');
      } catch (error) {
        console.error(error);
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialCategory, initialSearch, initialSort, isInitialQuery, queryCategory, querySearch, querySort]);

  const handleSortChange = (event) => {
    const params = new URLSearchParams(searchParams.toString());

    if (event.target.value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', event.target.value);
    }

    router.push(params.toString() ? `/?${params.toString()}#shop` : '/#shop');
  };

  const loadMoreProducts = async () => {
    setLoadingMore(true);

    try {
      const rows = await getAllProducts({
        ...(queryCategory ? { category: queryCategory } : {}),
        ...(querySearch ? { search: querySearch } : {}),
        ...(querySort !== 'newest' ? { sort: querySort } : {}),
        offset: products.length,
        limit: 11,
      });

      setProducts((current) => [...current, ...rows.slice(0, 10)]);
      setHasMore(rows.length > 10);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section id="shop" className="mx-auto w-full max-w-[1180px] px-2 py-5 sm:px-3 lg:py-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Shop now</p>
          <h2 className="text-2xl font-bold text-slate-950">
            {queryCategory ? categoryName || `Category ${queryCategory}` : querySearch ? `Search results for "${querySearch}"` : 'Explore Products'}
          </h2>
          {(queryCategory || querySearch) && (
            <Link href="/#shop" className="mt-1 inline-block text-sm font-semibold text-slate-500 hover:text-rose-600">
              Clear filters
            </Link>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            value={querySort}
            onChange={handleSortChange}
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
        <ProductGridSkeleton />
      ) : (
        <>
          <Cards products={products} />
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-70"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
