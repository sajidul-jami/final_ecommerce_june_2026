'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '../lib/api';

const getSource = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;

  const referrer = document.referrer.toLowerCase();
  if (!referrer) return 'direct';
  if (referrer.includes('facebook') || referrer.includes('fb.')) return 'facebook';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('youtube')) return 'youtube';
  if (referrer.includes('instagram')) return 'instagram';
  return 'referral';
};

const getSessionId = () => {
  const key = 'visitor_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, value);
  return value;
};

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payload = {
      session_id: getSessionId(),
      page_url: `${window.location.pathname}${window.location.search}`,
      page_title: document.title,
      referrer: document.referrer,
      source: getSource(),
      user_agent: navigator.userAgent,
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE_URL}/track-visit`, new Blob([body], { type: 'application/json' }));
      return;
    }

    fetch(`${API_BASE_URL}/track-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
