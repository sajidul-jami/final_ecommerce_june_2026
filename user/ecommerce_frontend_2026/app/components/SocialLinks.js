'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

const fallbackLinks = [
  { platform: 'Facebook', url: 'https://facebook.com' },
  { platform: 'Instagram', url: 'https://instagram.com' },
  { platform: 'YouTube', url: 'https://youtube.com' },
];

export default function SocialLinks() {
  const [links, setLinks] = useState(fallbackLinks);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/social-links');
        if (data.length) setLinks(data);
      } catch {
        setLinks(fallbackLinks);
      }
    };

    load();
  }, []);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.id || link.platform}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-500 hover:text-rose-600"
        >
          {link.platform}
        </a>
      ))}
    </div>
  );
}
