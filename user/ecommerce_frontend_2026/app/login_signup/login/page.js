'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';
import { apiFetch } from '../../lib/api';

function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUser();
  const redirectTo = searchParams.get('redirect') || '/cart';

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ phone_number: loginId, email: loginId, password }),
      });

      login(data.user);
      router.push(redirectTo);
    } catch (loginError) {
      setError(loginError.message || 'Invalid phone/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-8">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Welcome back</p>
        <h1 className="text-3xl font-black text-slate-950">Login</h1>
        {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Phone or email
          <input
            type="text"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-slate-950 p-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href={`/login_signup/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-rose-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
