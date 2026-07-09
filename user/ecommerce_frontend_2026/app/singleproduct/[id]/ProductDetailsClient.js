'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RelatedProducts from '../../components/Related_Products';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { apiFetch } from '../../lib/api';
import StarRating from '../../components/StarRating';
import ProductGallery from './ProductGallery';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export default function ProductDetailsClient({ product }) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart, setCheckoutItems } = useCart();
  const inStock = Number(product.quantity) > 0;
  const hasOffer = Boolean(product.offer_id) && Number(product.regular_price || 0) > Number(product.price || 0);
  const displayPrice = Number(product.offer_price || product.price || 0);
  const regularPrice = Number(product.regular_price || product.price || 0);
  const discountLabel =
    product.badge_text || product.discount_label || (product.save_percent ? `${product.save_percent}% OFF` : '');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      setReviews(await apiFetch(`/products/${product.id}/reviews`));
    } catch (error) {
      setReviews([]);
    } finally {
      setReviewsLoaded(true);
    }
  }, [product.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const reviewSummary = useMemo(() => {
    const totalReviews = reviewsLoaded ? reviews.length : Number(product.review_count || 0);
    const averageRating = reviewsLoaded && reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
      : Number(product.avg_rating || 0);

    return {
      totalReviews,
      averageRating: totalReviews ? averageRating : 0
    };
  }, [product.avg_rating, product.review_count, reviews, reviewsLoaded]);

  const shareLinks = useMemo(() => {
    const url = encodeURIComponent(shareUrl || '');
    const title = encodeURIComponent(product.name || 'Product');
    const text = encodeURIComponent(`Check out ${product.name}`);

    return [
      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
      { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${url}` },
      { label: 'Messenger', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
      { label: 'Telegram', href: `https://t.me/share/url?url=${url}&text=${text}` },
      { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
      { label: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}` },
      { label: 'Email', href: `mailto:?subject=${title}&body=${text}%0A${url}` }
    ];
  }, [product.name, shareUrl]);

  const copyShareLink = async () => {
    if (!shareUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setShareMessage('Link copied.');
    } catch {
      setShareMessage('Copy failed. Please copy the browser URL.');
    }
  };

  const handleBuyNow = () => {
    setCheckoutItems([{ ...product, stock_quantity: Number(product.quantity || 0), quantity: 1 }]);

    // Old flow kept for reference. Direct buy now allows guest checkout.
    // if (!user) {
    //   router.push('/login_signup/login?redirect=/checkout');
    //   return;
    // }

    router.push('/checkout');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewMessage('');

    if (!user) {
      router.push(`/login_signup/login?redirect=/product/${product.slug || product.id}`);
      return;
    }

    try {
      await apiFetch(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });
      setReviewForm({ rating: 5, title: '', comment: '' });
      setReviewMessage('Review submitted.');
      loadReviews();
    } catch (error) {
      setReviewMessage(error.message || 'Review submit failed.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-1.5 pb-40 pt-3 text-slate-950 sm:px-2 lg:pb-6">
      <div className="mx-auto max-w-[1260px]">
        <section className="grid gap-3 rounded-md bg-white p-2 shadow-sm md:grid-cols-[minmax(430px,48%)_1fr] lg:gap-5 lg:p-3 xl:grid-cols-[minmax(500px,48%)_1fr]">
          <ProductGallery product={product} />

          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              {product.category_name || 'Tech product'}
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm text-slate-500">SKU: {product.sku || `TTBD-${product.id}`}</p>
            {product.brand_name && (
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Brand:{' '}
                {product.brand_slug ? (
                  <Link href={`/brand/${product.brand_slug}`} className="text-rose-600 hover:text-rose-700">
                    {product.brand_name}
                  </Link>
                ) : (
                  product.brand_name
                )}
              </p>
            )}
            <div className="mt-5">
              {hasOffer && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                    {discountLabel || 'Offer'}
                  </span>
                  {Number(product.save_amount || 0) > 0 && (
                    <span className="text-sm font-bold text-emerald-600">
                      Save {taka.format(Number(product.save_amount || 0))}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-black text-rose-600">{taka.format(displayPrice)}</p>
                {hasOffer && (
                  <p className="text-lg font-bold text-slate-400 line-through">{taka.format(regularPrice)}</p>
                )}
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-bold text-slate-950">Stock</p>
                <p>{inStock ? `${product.quantity} available` : 'Sold out'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-bold text-slate-950">Sold</p>
                <p>{Number(product.sold_count || 0)} sold</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-bold text-slate-950">Delivery</p>
                <p>Fast local delivery</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-bold text-slate-950">Payment</p>
                <p>COD, Bkash, Nagad</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Reviews Summary</p>
              {reviewSummary.totalReviews > 0 ? (
                <a href="#reviews" className="mt-3 grid gap-3 rounded-md text-sm outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-950 sm:grid-cols-3">
                  <div>
                    <p className="font-bold text-slate-950">Average Rating</p>
                    <p className="mt-1 text-slate-600">{reviewSummary.averageRating.toFixed(1)} / 5</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">Total Reviews</p>
                    <p className="mt-1 text-slate-600">{reviewSummary.totalReviews}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">Star Rating</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={reviewSummary.averageRating} size="text-base" />
                      <span className="text-slate-600">{reviewSummary.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </a>
              ) : (
                <a href="#reviews" className="mt-3 block rounded-md text-sm font-semibold text-slate-500 outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-950">
                  No Reviews Yet
                </a>
              )}
            </div>

            <div className="fixed bottom-[4.8rem] left-0 right-0 z-40 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur lg:static lg:mt-6 lg:flex lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <button
                type="button"
                disabled={!inStock}
                onClick={() => addToCart({ ...product, stock_quantity: Number(product.quantity || 0) })}
                className="rounded-md border border-slate-950 px-5 py-3 font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="rounded-md bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Share</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {shareLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-950 hover:text-slate-950"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Copy Link
                </button>
              </div>
              {shareMessage && <p className="mt-2 text-sm font-semibold text-emerald-600">{shareMessage}</p>}
            </div>

          </div>
        </section>

        <section className="mt-5 rounded-lg bg-white p-4 shadow-sm lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Product details</p>
              <h2 className="mt-1 text-2xl font-black">Description</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-7 text-slate-600">{product.description || 'No description added yet.'}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Category</p>
                  <p className="mt-1 text-slate-600">{product.category_name || 'Uncategorized'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Brand</p>
                  <p className="mt-1 text-slate-600">
                    {product.brand_name ? (
                      product.brand_slug ? (
                        <Link href={`/brand/${product.brand_slug}`} className="font-semibold text-rose-600 hover:text-rose-700">
                          {product.brand_name}
                        </Link>
                      ) : product.brand_name
                    ) : 'No brand'}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Availability</p>
                  <p className="mt-1 text-slate-600">{inStock ? 'In stock' : 'Sold out'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Country of Origin</p>
                  <p className="mt-1 text-slate-600">{product.country_of_origin || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="mt-5 scroll-mt-28 grid gap-5 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[1fr_360px] lg:p-6">
          <div>
            <h2 className="text-xl font-black">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No reviews yet. Be the first to review this product.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{review.reviewer_name || 'Customer'}</p>
                      <StarRating rating={review.rating} size="text-sm" showValue />
                    </div>
                    {review.title && <p className="mt-2 text-sm font-bold text-slate-700">{review.title}</p>}
                    <p className="mt-1 text-sm leading-6 text-slate-600">{review.comment}</p>
                    {review.admin_reply && (
                      <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                        <span className="font-bold">Admin reply:</span> {review.admin_reply}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="h-fit rounded-md border border-slate-200 p-4">
            <h3 className="font-black">Write a review</h3>
            {reviewMessage && <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">{reviewMessage}</p>}
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Rating
              <select
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((form) => ({ ...form, rating: Number(event.target.value) }))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              >
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Title
              <input
                value={reviewForm.title}
                onChange={(event) => setReviewForm((form) => ({ ...form, title: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Review
              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))}
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <button type="submit" className="mt-4 w-full rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-rose-600">
              Submit Review
            </button>
          </form>
        </section>

        <RelatedProducts categoryId={product.category_id} currentId={product.id} />
      </div>
    </main>
  );
}
