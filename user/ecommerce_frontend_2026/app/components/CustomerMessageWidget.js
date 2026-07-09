'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useUser } from '../context/UserContext';

const emptyForm = { name: '', phone: '', email: '', subject: '', message: '' };

export default function CustomerMessageWidget() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.full_name || user.user_name || '',
      phone: current.phone || user.phone_number || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const loadMessages = async (phone = form.phone) => {
    if (!phone) return;
    try {
      const rows = await apiFetch(`/customer-messages?phone=${encodeURIComponent(phone)}`);
      setMessages(Array.isArray(rows) ? rows : []);
    } catch {
      setMessages([]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      await apiFetch('/customer-messages', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          user_id: user?.id || null,
          page_url: window.location.href,
        }),
      });
      setStatus('Message sent. Admin will reply soon.');
      setForm((current) => ({ ...current, subject: '', message: '' }));
      await loadMessages(form.phone);
    } catch (error) {
      setStatus(error.message || 'Message send failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) loadMessages();
        }}
        className="fixed bottom-[9rem] right-3 z-[55] rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl transition hover:bg-rose-600 lg:bottom-6"
      >
        Message
      </button>

      {open && (
        <section className="fixed bottom-[12.5rem] right-3 z-[70] w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl lg:bottom-20">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-rose-600">Need help?</p>
              <h2 className="font-black">Message us</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 font-black">
              x
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {status && <p className="mb-3 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">{status}</p>}
            <form onSubmit={submit} className="grid gap-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" required />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onBlur={() => loadMessages()} placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" required />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email optional" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" />
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" required />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message" className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950" required />
              <button disabled={loading} className="rounded-md bg-rose-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {messages.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Previous replies</p>
                {messages.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    <p className="font-black text-slate-900">{item.subject}</p>
                    <p className="mt-1 text-slate-600">{item.message}</p>
                    {item.admin_reply ? (
                      <p className="mt-2 rounded-md bg-emerald-50 p-2 font-semibold text-emerald-800">Admin: {item.admin_reply}</p>
                    ) : (
                      <p className="mt-2 text-xs font-bold text-amber-600">Waiting for reply</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
