'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
// import { useUser } from '../context/UserContext';
import ProductImage from './ProductImage';
import StarRating from './StarRating';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

const productHref = (product) => `/product/${product.slug || product.id}`;

export default function Cards({
  products = [],
  layout = 'grid',
  scrollRef,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onTouchStart,
  onTouchEnd,
  onScroll,
}) {
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

  const isScroll = layout === 'scroll';
  const isMarquee = layout === 'marquee';
  const containerClassName = isScroll
    ? 'flex w-full max-w-full gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    : isMarquee
      ? 'flex w-max max-w-none gap-3 overflow-visible pb-3 will-change-transform'
    : 'grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  const cardClassName = isScroll || isMarquee
    ? 'group flex min-h-[300px] w-[calc((100vw-2.25rem)/2)] max-w-[178px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:ring-rose-100 sm:min-h-[320px] sm:w-[210px] sm:max-w-none lg:w-[230px]'
    : 'group flex min-h-[310px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:ring-rose-100';

  return (
    <div
      ref={scrollRef}
      className={containerClassName}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onScroll={onScroll}
    >
      {products.map((product, index) => {
        const inStock = Number(product.quantity) > 0;
        const hasOffer = Boolean(product.offer_id) && Number(product.regular_price || 0) > Number(product.price || 0);
        const displayPrice = Number(product.offer_price || product.price || 0);
        const regularPrice = Number(product.regular_price || product.price || 0);
        const discountLabel =
          product.badge_text || product.discount_label || (product.save_percent ? `${product.save_percent}% OFF` : '');

        return (
          <article
            key={`${product.id}-${product.offer_id || 'product'}-${index}`}
            className={cardClassName}
          >
            <Link href={productHref(product)} className="relative block aspect-square bg-gradient-to-br from-slate-50 to-slate-100">
              <ProductImage
                photo={product.photo}
                alt={product.name || 'Product image'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-4"
              />
              <span className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${inStock ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                {inStock ? 'In stock' : 'Sold out'}
              </span>
              {hasOffer && (
                <span className="absolute right-2 top-2 rounded bg-rose-600 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  {discountLabel || 'Offer'}
                </span>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <Link href={productHref(product)} className="flex-1">
                <p className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-950">
                  {product.name}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">{product.category_name || 'Tech product'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span>{Number(product.sold_count || 0)} sold</span>
                  {Number(product.review_count || 0) > 0 && (
                    <StarRating rating={product.avg_rating} size="text-xs" showValue count={product.review_count} />
                  )}
                </div>
                {hasOffer ? (
                  <div className="mt-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-base font-black text-rose-600 sm:text-lg">{taka.format(displayPrice)}</p>
                      <p className="text-sm font-semibold text-slate-400 line-through">{taka.format(regularPrice)}</p>
                    </div>
                    {Number(product.save_amount || 0) > 0 && (
                      <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                        Save {taka.format(Number(product.save_amount || 0))}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-base font-black text-rose-600 sm:text-lg">{taka.format(displayPrice)}</p>
                )}
              </Link>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!inStock}
                  aria-label="Add to cart"
                  onClick={() => addToCart({ ...product, stock_quantity: Number(product.quantity || 0) })}
                  className="flex min-h-9 items-center justify-center rounded-md border border-slate-300 px-2 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-950 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 sm:hidden"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 8H6" />
                  </svg>
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => buyNow(product)}
                  className="rounded-md bg-rose-600 px-2 py-2 text-xs font-black text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
