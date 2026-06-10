'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { apiFetch } from '../lib/api';
import ProductImage from '../components/ProductImage';

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

const formatDate = (date) => {
  if (!date) return 'Not available';

  return new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

export default function UserProfile() {
  const { user, login, logout } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    city: '',
    address: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [addressMessage, setAddressMessage] = useState('');
  const [addressForm, setAddressForm] = useState({
    id: '',
    label: 'Home',
    recipient_name: '',
    phone_number: '',
    address_line: '',
    city: '',
    area: '',
    postal_code: '',
    is_default: true,
  });

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      full_name: user.full_name || user.user_name || '',
      phone_number: user.phone_number || '',
      email: user.email || '',
      city: user.city || '',
      address: user.address || user.location || '',
    });
    setAddressForm((form) => ({
      ...form,
      recipient_name: user.full_name || user.user_name || '',
      phone_number: user.phone_number || '',
      city: user.city || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      setAddresses([]);
      return;
    }

    let active = true;
    setLoadingOrders(true);
    setOrderError('');

    Promise.all([
      apiFetch(`/orders/${user.id}`),
      apiFetch(`/users/${user.id}/addresses`),
    ])
      .then(([orderData, addressData]) => {
        if (active) {
          setOrders(Array.isArray(orderData) ? orderData : []);
          setAddresses(Array.isArray(addressData) ? addressData : []);
        }
      })
      .catch((error) => {
        if (active) {
          setOrderError(error.message || 'Could not load account data.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadingOrders(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');

    try {
      const data = await apiFetch('/update-user', {
        method: 'POST',
        body: JSON.stringify({
          id: user.id,
          full_name: profileForm.full_name,
          name: profileForm.full_name,
          phone_number: profileForm.phone_number,
          email: profileForm.email,
          city: profileForm.city,
          address: profileForm.address,
          location: profileForm.address,
        }),
      });

      if (data.user) {
        login(data.user);
      }

      setEditingProfile(false);
      setProfileMessage('Profile updated.');
    } catch (error) {
      setProfileMessage(error.message || 'Profile update failed.');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      id: '',
      label: 'Home',
      recipient_name: user.full_name || user.user_name || '',
      phone_number: user.phone_number || '',
      address_line: '',
      city: user.city || '',
      area: '',
      postal_code: '',
      is_default: addresses.length === 0,
    });
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressMessage('');

    try {
      const data = await apiFetch(`/users/${user.id}/addresses`, {
        method: 'POST',
        body: JSON.stringify(addressForm),
      });

      setAddresses(data.addresses || []);
      resetAddressForm();
      setAddressMessage('Address saved.');
    } catch (error) {
      setAddressMessage(error.message || 'Address save failed.');
    }
  };

  const editAddress = (address) => {
    setAddressForm({
      id: address.id,
      label: address.label || 'Home',
      recipient_name: address.recipient_name || '',
      phone_number: address.phone_number || '',
      address_line: address.address_line || '',
      city: address.city || '',
      area: address.area || '',
      postal_code: address.postal_code || '',
      is_default: Boolean(address.is_default),
    });
  };

  const deleteAddress = async (addressId) => {
    setAddressMessage('');

    try {
      await apiFetch(`/users/${user.id}/addresses/${addressId}`, { method: 'DELETE' });
      setAddresses((items) => items.filter((item) => Number(item.id) !== Number(addressId)));
      setAddressMessage('Address deleted.');
    } catch (error) {
      setAddressMessage(error.message || 'Address delete failed.');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-center text-slate-600">
        You need to be logged in to view this page.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-5">
      <section className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Account</p>
            <h1 className="text-3xl font-black">User Profile</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditingProfile((value) => !value)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:border-slate-950"
          >
            {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {profileMessage && <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">{profileMessage}</p>}

        {editingProfile ? (
          <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Full name
              <input
                value={profileForm.full_name}
                onChange={(event) => setProfileForm((form) => ({ ...form, full_name: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone
              <input
                value={profileForm.phone_number}
                onChange={(event) => setProfileForm((form) => ({ ...form, phone_number: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((form) => ({ ...form, email: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              City
              <input
                value={profileForm.city}
                onChange={(event) => setProfileForm((form) => ({ ...form, city: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Main address
              <textarea
                value={profileForm.address}
                onChange={(event) => setProfileForm((form) => ({ ...form, address: event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
            <button type="submit" className="rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-rose-600">
              Save Profile
            </button>
          </form>
        ) : (
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold text-slate-500">Name</p>
              <p className="mt-1 text-slate-950">{user.full_name || user.user_name || 'Customer'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold text-slate-500">Phone</p>
              <p className="mt-1 text-slate-950">{user.phone_number || 'Not added'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold text-slate-500">Email</p>
              <p className="mt-1 text-slate-950">{user.email || 'Not added'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold text-slate-500">City</p>
              <p className="mt-1 text-slate-950">{user.city || 'Not added'}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login_signup/login');
          }}
          className="mt-6 rounded-md bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
        >
          Logout
        </button>
      </section>

      <section className="mx-auto mt-5 max-w-5xl rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Delivery</p>
        <h2 className="text-2xl font-black">Home & Office Addresses</h2>
        {addressMessage && <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">{addressMessage}</p>}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No saved address yet. Add Home or Office address.
              </p>
            ) : (
              addresses.map((address) => (
                <article key={address.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black">
                      {address.label} {address.is_default ? <span className="text-xs text-emerald-600">Default</span> : null}
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editAddress(address)} className="text-sm font-bold text-slate-600 hover:text-slate-950">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteAddress(address.id)} className="text-sm font-bold text-rose-600 hover:text-rose-700">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{address.recipient_name} | {address.phone_number}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {[address.address_line, address.area, address.city, address.postal_code].filter(Boolean).join(', ')}
                  </p>
                </article>
              ))
            )}
          </div>

          <form onSubmit={handleAddressSubmit} className="h-fit rounded-md border border-slate-200 p-4">
            <h3 className="font-black">{addressForm.id ? 'Edit Address' : 'Add Address'}</h3>
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Type
              <select
                value={addressForm.label}
                onChange={(event) => setAddressForm((form) => ({ ...form, label: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              >
                <option>Home</option>
                <option>Office</option>
              </select>
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Recipient name
              <input
                value={addressForm.recipient_name}
                onChange={(event) => setAddressForm((form) => ({ ...form, recipient_name: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Phone
              <input
                value={addressForm.phone_number}
                onChange={(event) => setAddressForm((form) => ({ ...form, phone_number: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Address
              <textarea
                value={addressForm.address_line}
                onChange={(event) => setAddressForm((form) => ({ ...form, address_line: event.target.value }))}
                className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Area"
                value={addressForm.area}
                onChange={(event) => setAddressForm((form) => ({ ...form, area: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              />
              <input
                placeholder="City"
                value={addressForm.city}
                onChange={(event) => setAddressForm((form) => ({ ...form, city: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                required
              />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={addressForm.is_default}
                onChange={(event) => setAddressForm((form) => ({ ...form, is_default: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-rose-600"
              />
              Use as default address
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="submit" className="rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-rose-600">
                Save
              </button>
              <button type="button" onClick={resetAddressForm} className="rounded-md border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:border-slate-950">
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-5xl rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Orders</p>
            <h2 className="text-2xl font-black">Order Status</h2>
          </div>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:border-slate-950"
          >
            Continue Shopping
          </button>
        </div>

        {loadingOrders && <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-600">Loading orders...</p>}

        {orderError && <p className="mt-5 rounded-md bg-rose-50 p-4 text-sm font-semibold text-rose-700">{orderError}</p>}

        {!loadingOrders && !orderError && orders.length === 0 && (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-500">
            <p className="font-semibold">No orders found yet.</p>
            <p className="mt-1 text-sm">After checkout, your order status will appear here.</p>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <p className="text-sm font-black">Order #{order.id}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    Order: {order.order_status || 'Pending'}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    Payment: {order.payment_status || 'Unpaid'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(order.items || []).map((item) => (
                  <div key={`${order.id}-${item.product_id}`} className="grid grid-cols-[64px_1fr] gap-3">
                    <div className="relative aspect-square rounded-md bg-slate-100">
                      <ProductImage
                        photo={item.photo}
                        alt={item.name || 'Product image'}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold">{item.name || 'Product'}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.quantity} x {taka.format(Number(item.price || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm">
                <span className="font-semibold text-slate-500">{order.payment_method || 'Cash On Delivery'}</span>
                <span className="text-lg font-black">{taka.format(Number(order.total_amount || 0))}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
