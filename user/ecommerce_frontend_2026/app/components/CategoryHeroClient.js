'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRODUCT_IMAGE_BASE_URL } from '@/app/lib/api';

const parentRules = [
  { label: 'Laptop', code: 'laptop', match: ['laptop', 'notebook', 'macbook'] },
  { label: 'Desktop PC', code: 'desktop-pc', match: ['desktop', 'pc', 'computer'] },
  { label: 'Mobile', code: 'mobile', match: ['mobile', 'phone', 'samsung', 'iphone'] },
  { label: 'Tablet', code: 'tablet', match: ['tablet', 'ipad'] },
  { label: 'Gaming', code: 'gaming', match: ['gaming', 'console'] },
  { label: 'Accessories', code: 'accessories', match: ['accessory', 'keyboard', 'mouse', 'headphone', 'charger'] },
];

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getCategoryCode = (category) => String(category.cat_code || category.code || slugify(category.name));
const getCategorySlug = (category) => String(category.cat_slug || category.cat_code || slugify(category.name));
const categoryHref = (category) => `/category/${encodeURIComponent(getCategorySlug(category))}`;

const getMediaSrc = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/')) return imageUrl;
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${imageUrl}`;
};

const getParentCodeFromPath = (code) => {
  const parts = String(code || '').split('-').filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('-');
};

const inferParent = (category) => {
  const text = `${category.name || ''} ${category.cat_slug || ''} ${category.cat_code || ''}`.toLowerCase();
  return parentRules.find((rule) => rule.match.some((term) => text.includes(term))) || {
    label: category.name,
    code: getCategoryCode(category),
  };
};

const buildCategoryTree = (items) => {
  const source = items;
  const byCode = new Map(
    source.map((category) => {
      const code = getCategoryCode(category);
      return [code, { ...category, cat_code: code, children: [] }];
    })
  );
  const roots = [];
  const hasCodeHierarchy = source.some((category) => getParentCodeFromPath(getCategoryCode(category)));

  source.forEach((category) => {
    const code = getCategoryCode(category);
    const parentCode = category.parent_code || getParentCodeFromPath(code);

    if (parentCode && byCode.has(parentCode)) {
      byCode.get(parentCode).children.push(byCode.get(code));
      return;
    }

    roots.push(byCode.get(code));
  });

  if (hasCodeHierarchy || roots.some((category) => category.children.length)) {
    return roots;
  }

  const grouped = new Map();

  source.forEach((category) => {
    const parent = inferParent(category);

    if (!grouped.has(parent.code)) {
      grouped.set(parent.code, { name: parent.label, cat_code: parent.code, children: [] });
    }

    if (slugify(category.name) !== parent.code) {
      grouped.get(parent.code).children.push(category);
    }
  });

  return Array.from(grouped.values());
};

function CategoryMenuItem({ category, activeCategory, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children?.length > 0;
  const isActive = [category.cat_code, category.cat_slug, slugify(category.name)].filter(Boolean).includes(activeCategory);

  return (
    <div className={`relative ${depth === 0 ? 'group/depth0' : 'group/depth1'}`}>
      <div className={`flex w-full items-center gap-1 rounded-md transition hover:bg-rose-50 hover:text-rose-600 ${depth === 0 ? 'border border-slate-200' : 'text-slate-700'} ${isActive ? 'border-rose-500 bg-rose-50 text-rose-700' : ''}`}>
        <Link href={categoryHref(category)} className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm font-semibold">
          {category.name}
        </Link>
        {hasChildren && (
          <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} aria-label={`Toggle ${category.name} subcategories`} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-rose-600 lg:hidden">
            <span className={`transition ${isOpen ? 'rotate-90' : ''}`}>&gt;</span>
          </button>
        )}
        {hasChildren && <span className="hidden pr-3 text-slate-400 lg:inline">&gt;</span>}
      </div>

      {hasChildren && (
        <div className={`${isOpen ? 'mt-1 grid' : 'hidden'} gap-1 rounded-md bg-slate-50 p-2 lg:invisible lg:absolute lg:z-30 lg:grid lg:w-56 lg:rounded-md lg:border lg:border-slate-200 lg:bg-white lg:opacity-0 lg:shadow-xl lg:transition-all lg:duration-200 ${depth === 0 ? 'lg:left-[calc(100%-1px)] lg:top-0 lg:mt-0 lg:group-hover/depth0:visible lg:group-hover/depth0:opacity-100' : 'lg:left-[calc(100%-1px)] lg:top-0 lg:group-hover/depth1:visible lg:group-hover/depth1:opacity-100'}`}>
          {category.children.slice(0, 12).map((child) => (
            <CategoryMenuItem key={child.id || child.cat_code || child.name} category={child} activeCategory={activeCategory} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryHeroClient({ initialCategories = [], initialSliders = [] }) {
  const searchParams = useSearchParams();
  const [sliders] = useState(initialSliders);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    if (sliders.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % sliders.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [sliders.length]);

  const categoryTree = buildCategoryTree(initialCategories);
  const activeSlide = sliders[activeSlideIndex] || null;

  return (
    <section id="categories" className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1180px] gap-3 px-2 py-3 sm:px-3 sm:py-4 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-lg bg-white p-3 text-slate-900 shadow-xl shadow-slate-950/10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Shop by Category</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-400 lg:hidden">Tap arrow to see subcategories</p>
            </div>
            <Link href="/#shop" className="text-xs font-bold text-rose-600 hover:text-slate-950">All</Link>
          </div>
          {categoryTree.length ? (
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {categoryTree.slice(0, 8).map((category, index) => (
                <CategoryMenuItem key={category.id || category.cat_code || index} category={category} activeCategory={activeCategory} />
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-slate-200 p-3 text-sm font-semibold text-slate-500">No categories added yet.</p>
          )}
        </aside>

        <div className="relative min-h-[240px] overflow-hidden rounded-lg bg-slate-900 shadow-xl shadow-slate-950/20 sm:min-h-[320px]">
          {activeSlide?.image_url && (
            <Image src={getMediaSrc(activeSlide.image_url)} alt={activeSlide.title || 'Featured products'} fill priority sizes="(min-width: 1024px) calc(100vw - 320px), 100vw" className="object-cover opacity-80" unoptimized />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-slate-950/10" />
          <div className="relative flex min-h-[240px] max-w-2xl flex-col justify-center p-5 sm:min-h-[320px] sm:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">{activeSlide?.subtitle ? 'Featured now' : 'Bangladesh tech store'}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{activeSlide?.title || 'Quality Tech Products'}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-100 sm:text-base">{activeSlide?.subtitle || 'Laptops, tablets, gaming PCs and accessories with fast checkout and cash on delivery support.'}</p>
            {activeSlide?.button_link && (
              <Link href={activeSlide.button_link} className="mt-5 inline-flex w-fit rounded-md bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
                {activeSlide.button_text || 'Shop now'}
              </Link>
            )}
          </div>
          {sliders.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {sliders.map((slide, index) => (
                <button key={slide.id || index} type="button" onClick={() => setActiveSlideIndex(index)} className={`h-2.5 w-2.5 rounded-full border border-white ${activeSlideIndex === index ? 'bg-white' : 'bg-white/30'}`} aria-label={`Show slide ${index + 1}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
