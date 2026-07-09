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

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const productHref = (product) => `/product/${encodeURIComponent(product.slug || slugify(product.name) || product.id)}`;

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
    ? 'group flex min-h-[260px] w-[calc((100vw-2.25rem)/2)] max-w-[170px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:ring-rose-100 sm:min-h-[320px] sm:w-[210px] sm:max-w-none lg:w-[230px]'
    : 'group flex min-h-[270px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:ring-rose-100 sm:min-h-[310px]';

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
                className="object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-4"
              />
              <span className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px] ${inStock ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                {inStock ? 'In stock' : 'Sold out'}
              </span>
              {hasOffer && (
                <span className="absolute right-1.5 top-1.5 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white sm:right-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px]">
                  {discountLabel || 'Offer'}
                </span>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-2 sm:p-4">
              <Link href={productHref(product)} className="flex-1">
                <p className="line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[18px] text-slate-950 sm:min-h-[40px] sm:text-sm sm:leading-5">
                  {product.name}
                </p>
                <p className="mt-1 hidden truncate text-xs font-medium text-slate-500 sm:block">{product.category_name || 'Tech product'}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 sm:mt-2 sm:gap-2 sm:text-[11px]">
                  <span>{Number(product.sold_count || 0)} sold</span>
                  {Number(product.review_count || 0) > 0 && (
                    <StarRating rating={product.avg_rating} size="text-xs" showValue count={product.review_count} />
                  )}
                </div>
                {hasOffer ? (
                  <div className="mt-1.5 sm:mt-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-black text-rose-600 sm:text-lg">{taka.format(displayPrice)}</p>
                      <p className="text-xs font-semibold text-slate-400 line-through sm:text-sm">{taka.format(regularPrice)}</p>
                    </div>
                    {Number(product.save_amount || 0) > 0 && (
                      <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                        Save {taka.format(Number(product.save_amount || 0))}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm font-black text-rose-600 sm:mt-2 sm:text-lg">{taka.format(displayPrice)}</p>
                )}
              </Link>

              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
                <button
                  type="button"
                  disabled={!inStock}
                  aria-label="Add to cart"
                  onClick={() => addToCart({ ...product, stock_quantity: Number(product.quantity || 0) })}
                  className="flex min-h-8 items-center justify-center rounded-md border border-slate-300 px-2 py-1.5 text-xs font-bold text-slate-800 transition hover:border-slate-950 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9 sm:py-2"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 sm:hidden"
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
                  className="rounded-md bg-rose-600 px-2 py-1.5 text-xs font-black text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
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
