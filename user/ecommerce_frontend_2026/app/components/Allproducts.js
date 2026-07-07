import AllproductsClient from './AllproductsClient';
import getAllProducts from '@/app/lib/mysqldb';
import { apiFetch } from '@/app/lib/api';

async function getInitialCategoryName(categoryCode) {
  if (!categoryCode) return '';

  try {
    const categories = await apiFetch('/categories', { cache: 'no-store' });
    return categories.find((item) => item.cat_code === categoryCode || item.cat_slug === categoryCode)?.name || '';
  } catch {
    return '';
  }
}

export default async function Allproducts({ search = '', category = '', sort = 'newest' }) {
  let initialProducts = [];
  let initialHasMore = false;
  let initialCategoryName = '';

  try {
    const [productRows, categoryName] = await Promise.all([
      getAllProducts({
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
        ...(sort !== 'newest' ? { sort } : {}),
        limit: 11,
      }),
      getInitialCategoryName(category),
    ]);

    initialProducts = productRows.slice(0, 10);
    initialHasMore = productRows.length > 10;
    initialCategoryName = categoryName;
  } catch {
    initialProducts = [];
    initialHasMore = false;
  }

  return (
    <AllproductsClient
      initialProducts={initialProducts}
      initialCategoryName={initialCategoryName}
      initialHasMore={initialHasMore}
      initialSearch={search}
      initialCategory={category}
      initialSort={sort || 'newest'}
    />
  );
}
