'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useUser } from '../context/UserContext';

const emptyForm = { name: '', phone: '', message: '' };
const identityKey = 'customer_message_identity';

const ChatIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4.5 12.2C4.5 7.9 8 4.8 12 4.8s7.5 3.1 7.5 7.4-3.5 7.4-7.5 7.4c-.9 0-1.8-.2-2.6-.5L5.6 20l.9-3.4a7.2 7.2 0 0 1-2-4.4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M8.3 11.2h7.4M8.3 14h4.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const SendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m4 12 16-7-5.4 14-3-6.1L4 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="m11.6 12.9 3.8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function CustomerMessageWidget() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const historyRef = useRef(null);
  const userName = user?.full_name || user?.user_name || '';
  const userPhone = user?.phone_number || user?.phone || '';
  const hasLoggedInContact = Boolean(userName && userPhone);

  useEffect(() => {
    const saved = localStorage.getItem(identityKey);
    if (!saved) return;

    try {
      const identity = JSON.parse(saved);
      setForm((current) => ({
        ...current,
        name: current.name || identity.name || '',
        phone: current.phone || identity.phone || '',
      }));
    } catch {
      localStorage.removeItem(identityKey);
    }
  }, []);

  useEffect(() => {
    if (!userName && !userPhone) return;
    setForm((current) => ({
      ...current,
      name: userName || current.name,
      phone: userPhone || current.phone,
    }));
  }, [userName, userPhone]);

  useEffect(() => {
    if (!open || !historyRef.current) return;
    historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [open, messages]);

  const loadMessages = useCallback(async (phone = form.phone) => {
    const safePhone = String(phone || '').trim();
    if (!safePhone) return;

    try {
      const rows = await apiFetch(`/customer-messages?phone=${encodeURIComponent(safePhone)}`);
      setMessages(Array.isArray(rows) ? rows.reverse() : []);
    } catch {
      setMessages([]);
    }
  }, [form.phone]);

  useEffect(() => {
    const phone = form.phone.trim();
    if (!open || !phone) return undefined;

    loadMessages(phone);
    const timer = setInterval(() => loadMessages(phone), 8000);
    const refreshOnFocus = () => loadMessages(phone);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [form.phone, loadMessages, open]);

  const submit = async (event) => {
    event.preventDefault();
    const safeName = form.name.trim();
    const safePhone = form.phone.trim();
    const safeMessage = form.message.trim();

    if (!safeName || !safePhone || !safeMessage) {
      setStatus('Name, phone and message needed.');
      return;
    }

    setStatus('');
    setLoading(true);

    try {
      localStorage.setItem(identityKey, JSON.stringify({ name: safeName, phone: safePhone }));
      await apiFetch('/customer-messages', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || null,
          name: safeName,
          phone: safePhone,
          subject: document.title || 'Customer message',
          message: safeMessage,
          page_url: window.location.href,
        }),
      });
      setForm((current) => ({ ...current, message: '' }));
      await loadMessages(safePhone);
    } catch (error) {
      setStatus(error.message || 'Message send failed.');
    } finally {
      setLoading(false);
    }
  };

  const openWidget = () => {
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openWidget())}
        className="fixed bottom-[9rem] right-3 z-[55] grid h-14 w-14 place-items-center rounded-full bg-rose-600 text-white shadow-2xl shadow-rose-600/30 ring-4 ring-white transition hover:bg-rose-700 lg:bottom-6 lg:right-8 lg:h-16 lg:w-16"
        aria-label={open ? 'Close message chat' : 'Open message chat'}
      >
        {open ? <CloseIcon size={24} /> : <ChatIcon size={28} />}
      </button>

      {open && (
        <section className="fixed bottom-[13rem] right-3 z-[70] flex h-[min(72vh,560px)] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white text-slate-950 shadow-2xl lg:bottom-24 lg:right-8 lg:h-[620px] lg:w-[460px] lg:max-w-none xl:w-[500px]">
          <div className="bg-gradient-to-r from-rose-600 to-red-500 px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white/75">Live message</p>
                <h2 className="text-lg font-black">How can we help?</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                <CloseIcon size={18} />
              </button>
            </div>
          </div>

          <div ref={historyRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {!messages.length && (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
                Send a quick message. We will reply here automatically.
              </div>
            )}

            {messages.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm">
                  {item.message}
                </div>
                {item.admin_reply ? (
                  <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <p className="mb-1 text-xs font-black uppercase tracking-wide text-rose-600">Admin reply</p>
                    {item.admin_reply}
                  </div>
                ) : (
                  <p className="text-right text-xs font-bold text-amber-600">Waiting for admin reply</p>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-2 border-t border-slate-100 bg-white p-3">
            {status && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{status}</p>}
            {!hasLoggedInContact && (
              <div className="grid grid-cols-2 gap-2">
                {!userName && (
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Name"
                    className="min-w-0 rounded-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                    required
                  />
                )}
                {!userPhone && (
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    onBlur={() => loadMessages()}
                    placeholder="Phone"
                    className={`${userName ? 'col-span-2' : ''} min-w-0 rounded-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500`}
                    required
                  />
                )}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-rose-500">
              <textarea
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Type your message..."
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                required
              />
              <button
                disabled={loading}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
                aria-label="Send message"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
