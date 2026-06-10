'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';
import { apiFetch } from '@/app/lib/api';

export default function Allproducts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const querySort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        setSearch(querySearch);
        setCategory(queryCategory);
        const [productRows, categoryRows] = await Promise.all([
          getAllProducts({
            ...(queryCategory ? { category: queryCategory } : {}),
            ...(querySearch ? { search: querySearch } : {}),
            ...(querySort !== 'newest' ? { sort: querySort } : {}),
          }),
          queryCategory ? apiFetch('/categories') : Promise.resolve([]),
        ]);
        const activeCategory = categoryRows.find((item) => item.cat_code === queryCategory || item.cat_slug === queryCategory);

        setProducts(productRows);
        setCategoryName(activeCategory?.name || '');
        setVisibleCount(10);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryCategory, querySearch, querySort]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.description, product.category_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [products, search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    router.push(params.toString() ? `/?${params.toString()}#shop` : '/#shop');
  };

  const handleSortChange = (event) => {
    const params = new URLSearchParams(searchParams.toString());

    if (event.target.value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', event.target.value);
    }

    router.push(params.toString() ? `/?${params.toString()}#shop` : '/#shop');
  };

  return (
    <section id="shop" className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Shop now</p>
          <h2 className="text-2xl font-bold text-slate-950">
            {category ? categoryName || `Category ${category}` : search ? `Search results for "${search}"` : 'All Products'}
          </h2>
          {(category || querySearch) && (
            <Link href="/#shop" className="mt-1 inline-block text-sm font-semibold text-slate-500 hover:text-rose-600">
              Clear filters
            </Link>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex w-full overflow-hidden rounded-md border border-slate-300 bg-white sm:w-96">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, SKU, category"
              className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none"
            />
            <button type="submit" className="bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">
              Search
            </button>
          </form>
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
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm">Loading products...</div>
      ) : (
        <>
          <Cards products={filteredProducts.slice(0, visibleCount)} />
          {filteredProducts.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 10)}
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
