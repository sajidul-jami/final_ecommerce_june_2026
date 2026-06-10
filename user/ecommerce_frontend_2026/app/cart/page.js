'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import ProductImage from '../components/ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, setCheckoutItems } = useCart();
  const { user } = useUser();
  const [selectedItems, setSelectedItems] = useState([]);
  const router = useRouter();

  const toggleItemSelection = (itemId) => {
    const numericId = Number(itemId);
    setSelectedItems((items) =>
      items.includes(numericId) ? items.filter((id) => id !== numericId) : [...items, numericId]
    );
  };

  const allSelected = cart.length > 0 && selectedItems.length === cart.length;
  const selectedProducts = cart.filter((item) => selectedItems.includes(Number(item.id)));
  const checkoutTotal = selectedProducts.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const toggleSelectAll = () => {
    setSelectedItems(allSelected ? [] : cart.map((item) => Number(item.id)));
  };

  const removeSelected = () => {
    selectedItems.forEach((itemId) => removeFromCart(itemId));
    setSelectedItems([]);
  };

  const handleBuyNow = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one item to purchase.');
      return;
    }

    setCheckoutItems(selectedProducts);

    if (!user) {
      router.push('/login_signup/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Review items</p>
            <h1 className="text-3xl font-black">Your Cart</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-rose-600">
            Continue shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-slate-500">Add a product first, then come back for checkout.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 rounded border-slate-300 text-rose-600"
                  />
                  Select All
                </label>
                <button
                  type="button"
                  onClick={removeSelected}
                  disabled={selectedItems.length === 0}
                  className="rounded-md border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 hover:border-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove Selected
                </button>
              </div>
              {cart.map((item) => (
                <article key={item.id} className="grid gap-3 rounded-lg bg-white p-3 shadow-sm sm:grid-cols-[auto_96px_1fr_auto] sm:items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(Number(item.id))}
                    onChange={() => toggleItemSelection(item.id)}
                    className="h-5 w-5 rounded border-slate-300 text-rose-600"
                  />
                  <div className="relative aspect-square w-24 rounded-md bg-slate-100">
                    <ProductImage
                      photo={item.photo}
                      alt={item.name || 'Product image'}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950">{item.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{taka.format(Number(item.price || 0))}</p>
                    <div className="mt-3 inline-flex items-center overflow-hidden rounded-md border border-slate-300">
                      <button type="button" onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 font-bold hover:bg-slate-100">
                        -
                      </button>
                      <span className="min-w-10 border-x border-slate-300 px-3 py-1 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button type="button" onClick={() => addToCart(item)} className="px-3 py-1 font-bold hover:bg-slate-100">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="font-black text-rose-600">{taka.format(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-slate-500 hover:text-rose-600">
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Selected items</span>
                  <span>{selectedProducts.length}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-950">
                  <span>Total</span>
                  <span>{taka.format(checkoutTotal)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                className="mt-5 w-full rounded-md bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-rose-600"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
