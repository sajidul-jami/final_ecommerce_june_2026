'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { apiFetch } from '../lib/api';
import ProductImage from '../components/ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

const emptyCheckoutForm = {
  full_name: '',
  phone_number: '',
  email: '',
  address: '',
  city: '',
  area: '',
  notes: '',
};

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCartItems, setCheckoutItems } = useCart();
  const { user } = useUser();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm);
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const hasInitializedSelection = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const cartIds = cart.map((item) => Number(item.id));

    if (cartIds.length === 0) {
      hasInitializedSelection.current = false;
      setSelectedItems([]);
      return;
    }

    setSelectedItems((items) => {
      if (!hasInitializedSelection.current) {
        hasInitializedSelection.current = true;
        return cartIds;
      }

      const availableIds = new Set(cartIds);
      return items.filter((id) => availableIds.has(id));
    });
  }, [cart]);

  useEffect(() => {
    if (!isCheckoutOpen) return;

    setCheckoutError('');
    setSuccessOrderId('');
    setCheckoutForm({
      full_name: user?.full_name || user?.user_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
      address: user?.address || user?.location || '',
      city: user?.city || '',
      area: '',
      notes: '',
    });
  }, [isCheckoutOpen, user]);

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
    setIsCheckoutOpen(true);

    // Old flow kept for reference. Guest checkout now opens a popup instead of forcing login.
    // if (!user) {
    //   router.push('/login_signup/login?redirect=/checkout');
    //   return;
    // }

    // router.push('/checkout');
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckoutForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setCheckoutError('');
    setSuccessOrderId('');

    if (!selectedProducts.length) {
      setCheckoutError('Please select at least one item.');
      return;
    }

    if (!checkoutForm.full_name || !checkoutForm.phone_number || !checkoutForm.address || !checkoutForm.city) {
      setCheckoutError('Name, phone, address and city are required.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const order = await apiFetch('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || null,
          payment_method: paymentMethod,
          delivery_address_id: null,
          delivery_name: checkoutForm.full_name,
          delivery_phone: checkoutForm.phone_number,
          delivery_email: checkoutForm.email,
          delivery_address: checkoutForm.address,
          delivery_city: checkoutForm.city,
          delivery_area: checkoutForm.area,
          order_notes: checkoutForm.notes,
          products: selectedProducts.map((product) => ({
            id: product.id,
            quantity: product.quantity,
          })),
        }),
      });

      clearCartItems(selectedProducts.map((product) => product.id));
      sessionStorage.removeItem('checkoutItems');
      setSuccessOrderId(order.orderId);
      setSelectedItems([]);
    } catch (error) {
      setCheckoutError(error.message || 'Checkout failed.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutError('');
    setSuccessOrderId('');
  };

  const continueShopping = () => {
    closeCheckout();
    router.push('/');
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

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                  {user ? 'Fast checkout' : 'Guest checkout'}
                </p>
                <h2 className="text-2xl font-black text-slate-950">Place your order</h2>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {successOrderId ? (
              <div className="p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Order placed</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">Thank you for your order.</h3>
                <p className="mt-2 text-slate-600">Your order ID is #{successOrderId}. We will contact you soon.</p>
                <button
                  type="button"
                  onClick={continueShopping}
                  className="mt-6 rounded-md bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-rose-600"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="grid gap-0 lg:grid-cols-[1fr_340px]">
                <section className="p-4 sm:p-6">
                  {!user && (
                    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-bold text-amber-900">Login is recommended, not required.</p>
                      <p className="mt-1 text-sm text-amber-800">
                        You can place the order as a guest now. Login only if you want saved address and profile order history.
                      </p>
                      <Link
                        href="/login_signup/login?redirect=/cart"
                        className="mt-3 inline-flex rounded-md bg-amber-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
                      >
                        Login
                      </Link>
                    </div>
                  )}

                  {checkoutError && (
                    <p className="mb-5 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{checkoutError}</p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Full name <span className="text-rose-600">*</span>
                      <input
                        name="full_name"
                        value={checkoutForm.full_name}
                        onChange={handleCheckoutChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Phone number <span className="text-rose-600">*</span>
                      <input
                        name="phone_number"
                        value={checkoutForm.phone_number}
                        onChange={handleCheckoutChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Email
                      <input
                        name="email"
                        type="email"
                        value={checkoutForm.email}
                        onChange={handleCheckoutChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      City <span className="text-rose-600">*</span>
                      <input
                        name="city"
                        value={checkoutForm.city}
                        onChange={handleCheckoutChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Area
                      <input
                        name="area"
                        value={checkoutForm.area}
                        onChange={handleCheckoutChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Payment
                      <select
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                      >
                        <option>Cash On Delivery</option>
                        <option>Bkash</option>
                        <option>Nagad</option>
                        <option>Card</option>
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                      Delivery address <span className="text-rose-600">*</span>
                      <textarea
                        name="address"
                        value={checkoutForm.address}
                        onChange={handleCheckoutChange}
                        className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                      Order notes
                      <textarea
                        name="notes"
                        value={checkoutForm.notes}
                        onChange={handleCheckoutChange}
                        className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                      />
                    </label>
                  </div>
                </section>

                <aside className="border-t border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-l lg:border-t-0">
                  <h3 className="text-lg font-black text-slate-950">Order Summary</h3>
                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="grid grid-cols-[56px_1fr] gap-3">
                        <div className="relative aspect-square rounded-md bg-white">
                          <ProductImage
                            photo={product.photo}
                            alt={product.name || 'Product image'}
                            fill
                            sizes="56px"
                            className="object-contain p-2"
                          />
                        </div>
                        <div>
                          <p className="line-clamp-2 text-sm font-bold text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-500">
                            {product.quantity} x {taka.format(Number(product.price || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-lg font-black text-slate-950">
                    <span>Total</span>
                    <span>{taka.format(checkoutTotal)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder || selectedProducts.length === 0}
                    className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingOrder ? 'Placing order...' : user ? 'Place Order' : 'Place Guest Order'}
                  </button>
                </aside>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
