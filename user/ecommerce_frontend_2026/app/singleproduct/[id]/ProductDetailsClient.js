'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RelatedProducts from '../../components/Related_Products';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { apiFetch } from '../../lib/api';
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
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      setReviews(await apiFetch(`/products/${product.id}/reviews`));
    } catch (error) {
      setReviews([]);
    }
  }, [product.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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
      router.push(`/login_signup/login?redirect=/singleproduct/${product.id}`);
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
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[420px_1fr] lg:p-6">
          <ProductGallery product={product} />

          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              {product.category_name || 'Tech product'}
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm text-slate-500">SKU: {product.sku || `TTBD-${product.id}`}</p>
            <p className="mt-5 text-3xl font-black text-rose-600">{taka.format(Number(product.price || 0))}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {Number(product.sold_count || 0)} sold
              {Number(product.review_count || 0) > 0 ? ` | ${Number(product.avg_rating || 0).toFixed(1)} stars from ${product.review_count} reviews` : ''}
            </p>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-bold text-slate-950">Stock</p>
                <p>{inStock ? `${product.quantity} available` : 'Sold out'}</p>
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                className="rounded-md bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
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
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Category</p>
                  <p className="mt-1 text-slate-600">{product.category_name || 'Uncategorized'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">SKU</p>
                  <p className="mt-1 text-slate-600">{product.sku || `TTBD-${product.id}`}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Availability</p>
                  <p className="mt-1 text-slate-600">{inStock ? 'In stock' : 'Sold out'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[1fr_360px] lg:p-6">
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
                      <p className="text-sm font-black text-amber-600">{review.rating} stars</p>
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
