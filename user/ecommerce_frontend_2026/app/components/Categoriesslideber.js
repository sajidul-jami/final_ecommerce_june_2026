'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Slideimage from '@/public/images/slideberimage01.jpeg';
import { apiFetch } from '@/app/lib/api';

const fallbackCategories = [
  { name: 'Laptop', cat_code: '000' },
  { name: 'Gaming Laptop', cat_code: '000-001' },
  { name: 'Core i7 Gaming Laptop', cat_code: '000-001-002' },
  { name: 'Mobile', cat_code: '100' },
];

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
  const source = items.length ? items : fallbackCategories;
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
  const hasChildren = category.children?.length > 0;
  const isActive = activeCategory === category.cat_code;

  return (
    // depth অনুযায়ী আলাদা group নাম ব্যবহার করা হয়েছে যেন এক হোভারে সব না খুলে যায়
    <div className={`relative ${depth === 0 ? 'group/depth0' : 'group/depth1'}`}>
      <Link
        href={`/?category=${encodeURIComponent(category.cat_code || slugify(category.name))}#shop`}
        className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-rose-50 hover:text-rose-600 ${
          depth === 0 ? 'border border-slate-200' : 'text-slate-700'
        } ${
          isActive ? 'border-rose-500 bg-rose-50 text-rose-700' : ''
        }`}
      >
        <span className="min-w-0 truncate">{category.name}</span>
        {hasChildren && <span className="text-slate-400">&gt;</span>}
      </Link>

      {hasChildren && (
        <div 
          className={`invisible absolute z-30 w-56 rounded-md border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all duration-200
            ${
              // মেইন ক্যাটাগরি (depth 0) হলে হোভারে নিচে এবং ল্যাপটপে ডানপাশে খুলবে
              depth === 0 
                ? 'left-0 top-full mt-1 group-hover/depth0:visible group-hover/depth0:opacity-100 lg:left-[calc(100%-1px)] lg:top-0 lg:mt-0' 
                : 'left-[calc(100%-1px)] top-0 group-hover/depth1:visible group-hover/depth1:opacity-100'
            }
          `}
        >
          {category.children.slice(0, 12).map((child) => (
            <CategoryMenuItem
              key={child.id || child.cat_code || child.name}
              category={child}
              activeCategory={activeCategory}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Categoriesslideber() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategories(await apiFetch('/categories'));
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);



  const categoryTree = buildCategoryTree(categories);

  return (
    <section id="categories" className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-5 sm:px-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg bg-white p-3 text-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Categories</h2>
            <Link href="/#shop" className="text-xs font-bold text-rose-600 hover:text-slate-950">
              All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {categoryTree.slice(0, 8).map((category, index) => (
              <CategoryMenuItem
                key={category.id || category.cat_code || index}
                category={category}
                activeCategory={activeCategory}
              />
            ))}
          </div>
        </aside>

        <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-slate-900">
          <Image
            src={Slideimage}
            alt="Featured technology products"
            fill
            priority
            sizes="(min-width: 1024px) calc(100vw - 320px), 100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-slate-950/30" />
          <div className="relative flex min-h-[280px] max-w-2xl flex-col justify-center p-6 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Bangladesh tech store</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">Quality Tech Products</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-100 sm:text-base">
              Laptops, tablets, gaming PCs and accessories with fast checkout and cash on delivery support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}