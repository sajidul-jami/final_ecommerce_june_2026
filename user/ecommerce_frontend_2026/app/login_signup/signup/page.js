'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { useUser } from '../../context/UserContext';

function SignupForm() {
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUser();
  const redirectTo = searchParams.get('redirect') || '/cart';

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await apiFetch('/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (data.user) {
        login(data.user);
        setSuccess('Account created. Taking you back...');
        router.push(redirectTo);
        return;
      }

      setSuccess('Account created. Please login once.');
      router.push(`/login_signup/login?redirect=${encodeURIComponent(redirectTo)}`);
    } catch (signupError) {
      setError(signupError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-8">
      <form onSubmit={handleSignup} className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Create account</p>
        <h1 className="text-3xl font-black text-slate-950">Sign Up</h1>
        {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        {success && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Full name
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Phone number
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-slate-950 p-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href={`/login_signup/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-rose-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
