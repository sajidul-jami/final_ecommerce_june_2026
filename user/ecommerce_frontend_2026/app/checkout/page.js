'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../lib/api';
import { defaultSiteSettings } from '../lib/siteSettings';
import ProductImage from '../components/ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { user, login } = useUser();
  const { getCheckoutItems, clearCartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [form, setForm] = useState({ full_name: '', phone_number: '', email: '', address: '', city: '', area: '', notes: '' });
  const [deliveryZone, setDeliveryZone] = useState('');
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');

  useEffect(() => {
    // Old flow kept for reference. Checkout now supports guest orders.
    // if (!user) {
    //   router.push('/login_signup/login?redirect=/checkout');
    //   return;
    // }

    setProducts(getCheckoutItems());
    setForm({
      full_name: user?.full_name || user?.user_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
      address: user?.address || user?.location || '',
      city: user?.city || '',
      area: '',
      notes: '',
    });

    if (!user) {
      setAddresses([]);
      return;
    }

    apiFetch(`/users/${user.id}/addresses`)
      .then((data) => {
        const savedAddresses = Array.isArray(data) ? data : [];
        setAddresses(savedAddresses);
        const defaultAddress = savedAddresses.find((address) => address.is_default) || savedAddresses[0];

        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
          setForm({
            full_name: defaultAddress.recipient_name || user.full_name || user.user_name || '',
            phone_number: defaultAddress.phone_number || user.phone_number || '',
            email: user.email || '',
            address: defaultAddress.address_line || '',
            city: defaultAddress.city || '',
            area: defaultAddress.area || '',
            notes: '',
          });
        }
      })
      .catch(() => setAddresses([]));
  }, [user, router, getCheckoutItems]);

  useEffect(() => {
    apiFetch('/site-settings')
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => setSettings(defaultSiteSettings));
  }, []);

  const subtotal = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0),
    [products]
  );
  const deliveryCharge = deliveryZone === 'Inside Dhaka'
    ? Number(settings.inside_dhaka_delivery_charge || 80)
    : deliveryZone === 'Outside Dhaka'
      ? Number(settings.outside_dhaka_delivery_charge || 120)
      : 0;
  const total = subtotal + deliveryCharge;

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleAddressSelect = (event) => {
    const value = event.target.value;
    setSelectedAddressId(value);
    const address = addresses.find((item) => String(item.id) === value);

    if (address) {
      setForm({
        full_name: address.recipient_name || form.full_name,
        phone_number: address.phone_number || form.phone_number,
        email: form.email,
        address: address.address_line || '',
        city: address.city || '',
        area: address.area || '',
        notes: form.notes,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessOrderId('');

    if (!products.length) {
      setError('No checkout items found.');
      return;
    }

    if (!form.full_name || !form.phone_number || !form.address || !form.city || !deliveryZone) {
      setError('Name, phone, address, city and delivery area are required.');
      return;
    }

    setSubmitting(true);

    try {
      if (user) {
        const updatedUser = await apiFetch('/update-user', {
          method: 'POST',
          body: JSON.stringify({
            id: user.id,
            full_name: form.full_name,
            name: form.full_name,
            phone_number: form.phone_number,
            address: form.address,
            location: form.address,
            city: form.city,
          }),
        });

        if (updatedUser.user) {
          login(updatedUser.user);
        }
      }

      const order = await apiFetch('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || null,
          payment_method: paymentMethod,
          delivery_address_id: selectedAddressId || null,
          delivery_name: form.full_name,
          delivery_phone: form.phone_number,
          delivery_email: form.email,
          delivery_address: form.address,
          delivery_city: form.city,
          delivery_area: form.area,
          delivery_zone: deliveryZone,
          order_notes: form.notes,
          products: products.map((product) => ({
            id: product.id,
            quantity: product.quantity,
          })),
        }),
      });

      clearCartItems(products.map((product) => product.id));
      sessionStorage.removeItem('checkoutItems');
      setSuccessOrderId(order.orderId);
    } catch (checkoutError) {
      setError(checkoutError.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-5">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Final step</p>
          <h1 className="text-3xl font-black">Checkout</h1>

          {!user && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">Login is recommended, not required.</p>
              <p className="mt-1 text-sm text-amber-800">
                Continue as guest now, or login if you want saved address and profile order history.
              </p>
              <Link
                href="/login_signup/login?redirect=/checkout"
                className="mt-3 inline-flex rounded-md bg-amber-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
              >
                Login
              </Link>
            </div>
          )}

          {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}

          {addresses.length > 0 && (
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Saved address
              <select
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              >
                <option value="">Use different address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.address_line}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Full name <span className="text-rose-600">*</span>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone number <span className="text-rose-600">*</span>
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Delivery address <span className="text-rose-600">*</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email optional
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              City <span className="text-rose-600">*</span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Area optional
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Delivery area <span className="text-rose-600">*</span>
              <select
                value={deliveryZone}
                onChange={(event) => setDeliveryZone(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              >
                <option value="">Select delivery area</option>
                <option value="Inside Dhaka">Inside Dhaka - {taka.format(Number(settings.inside_dhaka_delivery_charge || 80))}</option>
                <option value="Outside Dhaka">Outside Dhaka - {taka.format(Number(settings.outside_dhaka_delivery_charge || 120))}</option>
              </select>
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
              Order notes optional
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
          </div>
        </section>

        <aside className="h-fit rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Order Items</h2>
          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-[64px_1fr] gap-3">
                <div className="relative aspect-square rounded-md bg-slate-100">
                  <ProductImage
                    photo={product.photo}
                    alt={product.name || 'Product image'}
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.quantity} x {taka.format(Number(product.price || 0))}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-lg font-black">
            <span>Subtotal</span>
            <span>{taka.format(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm font-bold text-slate-600">
            <span>Delivery Charge</span>
            <span>{deliveryZone ? taka.format(deliveryCharge) : 'Select area'}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-4 text-lg font-black">
            <span>Total</span>
            <span>{taka.format(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting || !products.length}
            className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Placing order...' : user ? 'Confirm Order' : 'Confirm Guest Order'}
          </button>
        </aside>
      </form>

      {successOrderId && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white">
              ✓
            </div>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-emerald-600">Order placed</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Thank you for your order.</h2>
            <p className="mt-2 text-slate-600">Your order ID is #{successOrderId}. We will contact you soon.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push(user ? '/user_profile' : '/cart')}
                className="rounded-md bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-rose-600"
              >
                {user ? 'View Orders' : 'Go to Cart'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-md border border-slate-300 px-4 py-3 font-bold text-slate-800 transition hover:border-slate-950"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
