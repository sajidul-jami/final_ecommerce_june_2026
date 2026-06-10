'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useUser } from '../context/UserContext';

export default function HelpSupportPage() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      name: user.full_name || user.user_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
    }));
  }, [user]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await apiFetch('/support-tickets', {
        method: 'POST',
        body: JSON.stringify({ ...form, user_id: user?.id || null }),
      });
      setMessage('Support request submitted. We will contact you soon.');
      setForm((current) => ({ ...current, subject: '', message: '' }));
    } catch (error) {
      setMessage(error.message || 'Support request failed.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-8 text-slate-950 sm:px-5">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Help & Support</p>
          <h1 className="text-3xl font-black">Contact Support</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Order, payment, product, delivery or warranty issue hole ekhane message din.
          </p>

          {message && <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">{message}</p>}

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Name
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone
              <input name="phone_number" value={form.phone_number} onChange={handleChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Subject
              <input name="subject" value={form.subject} onChange={handleChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950" required />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Message
              <textarea name="message" value={form.message} onChange={handleChange} className="mt-1 min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950" required />
            </label>
            <button type="submit" className="rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-rose-600">
              Send Request
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Contact Info</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><span className="font-bold text-slate-950">Phone:</span> +880 1700-000000</p>
            <p><span className="font-bold text-slate-950">Email:</span> support@techtrendsbd.com</p>
            <p><span className="font-bold text-slate-950">Address:</span> Dhaka, Bangladesh</p>
            <p><span className="font-bold text-slate-950">Hours:</span> 10:00 AM - 8:00 PM</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
