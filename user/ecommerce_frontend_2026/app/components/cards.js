'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
// import { useUser } from '../context/UserContext';
import ProductImage from './ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export default function Cards({ products = [] }) {
  const router = useRouter();
  const { addToCart, setCheckoutItems } = useCart();
  // const { user } = useUser();

  const buyNow = (product) => {
    setCheckoutItems([{ ...product, stock_quantity: Number(product.quantity || 0), quantity: 1 }]);

    // Old flow kept for reference. Direct buy now allows guest checkout.
    // if (!user) {
    //   router.push('/login_signup/login?redirect=/checkout');
    //   return;
    // }

    router.push('/checkout');
  };

  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => {
        const inStock = Number(product.quantity) > 0;

        return (
          <article
            key={product.id}
            className="group flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <Link href={`/singleproduct/${product.id}`} className="relative block aspect-square bg-slate-100">
              <ProductImage
                photo={product.photo}
                alt={product.name || 'Product image'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-contain p-3 transition group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                {inStock ? 'In stock' : 'Sold out'}
              </span>
            </Link>

            <div className="flex flex-1 flex-col p-3">
              <Link href={`/singleproduct/${product.id}`} className="flex-1">
                <p className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">{product.category_name || 'Tech product'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>{Number(product.sold_count || 0)} sold</span>
                  {Number(product.review_count || 0) > 0 && (
                    <span>{Number(product.avg_rating || 0).toFixed(1)} stars ({product.review_count})</span>
                  )}
                </div>
                <p className="mt-2 text-lg font-bold text-rose-600">{taka.format(Number(product.price || 0))}</p>
              </Link>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => addToCart({ ...product, stock_quantity: Number(product.quantity || 0) })}
                  className="rounded-md border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => buyNow(product)}
                  className="rounded-md bg-slate-950 px-2 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
