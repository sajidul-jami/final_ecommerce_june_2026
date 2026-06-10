"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Plus, Search, User } from "lucide-react"

import { getAdminPageTitle } from "@/lib/adminNavigation"

type NavbarProps = {
  onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname()
  const title = getAdminPageTitle(pathname)

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 print:hidden">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Admin</p>
            <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-xl">{title}</h1>
          </div>
        </div>

        <div className="hidden min-w-[220px] max-w-md flex-1 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, products, customers"
            className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/admin/products"
            className="hidden items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:flex"
          >
            <Plus size={16} />
            Product
          </Link>
          <Link
            href="/admin/products"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 sm:hidden"
            aria-label="Add product"
          >
            <Plus size={18} />
          </Link>
          <button
            type="button"
            className="relative hidden h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 sm:flex"
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <User size={17} />
            </div>
            <div className="hidden text-left text-sm sm:block">
              <p className="font-semibold leading-4 text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
