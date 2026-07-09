"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Menu, Plus, Search, User, X } from "lucide-react"

import { adminNavigation, getAdminPageTitle } from "@/lib/adminNavigation"
import { getAdminNotifications } from "@/services/notificationService"

type NavbarProps = {
  onMenuClick?: () => void
}

type NotificationItem = {
  id: string
  title: string
  description: string
  href: string
  tone: string
}

type NotificationState = {
  count: number
  items: NotificationItem[]
  summary: {
    pendingOrders: number
    openTickets: number
    openMessages: number
    pendingReviews: number
  }
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname()
  const title = getAdminPageTitle(pathname)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationState>({
    count: 0,
    items: [],
    summary: { pendingOrders: 0, openTickets: 0, openMessages: 0, pendingReviews: 0 }
  })
  const notificationRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true

    getAdminNotifications()
      .then((data) => {
        if (active) setNotifications(data)
      })
      .catch(() => {
        if (active) {
          setNotifications({
            count: 0,
            items: [],
            summary: { pendingOrders: 0, openTickets: 0, openMessages: 0, pendingReviews: 0 }
          })
        }
      })

    return () => {
      active = false
    }
  }, [pathname])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    const quickActions = [
      { href: "/admin/orders?status=Pending", label: "Pending Orders", keywords: "pending order new order" },
      { href: "/admin/support", label: "Open Support Tickets", keywords: "support ticket help customer" },
      { href: "/admin/messages", label: "Customer Messages", keywords: "message inbox reply customer" },
      { href: "/admin/visitors", label: "Visitor Analytics", keywords: "visitor source traffic ip analytics" },
      { href: "/admin/reviews", label: "Pending Reviews", keywords: "review rating approve" },
      { href: "/admin/site-settings", label: "Site Settings", keywords: "seo logo footer website delivery" }
    ]

    return [...adminNavigation, ...quickActions]
      .filter((item) => `${item.label} ${"keywords" in item ? item.keywords : ""}`.toLowerCase().includes(query))
      .slice(0, 6)
  }, [searchQuery])

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

        <div className="relative hidden min-w-[220px] max-w-md flex-1 md:block">
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search admin pages and actions"
              className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-700" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
              {searchResults.length ? searchResults.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setSearchQuery("")}
                  className="block border-b border-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 last:border-b-0 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              )) : (
                <p className="px-3 py-2.5 text-sm text-slate-500">No admin page found.</p>
              )}
            </div>
          )}
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
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} />
              {notifications.count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                  {notifications.count > 99 ? "99+" : notifications.count}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="fixed left-2 right-2 top-16 z-50 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">Notifications</p>
                    <Link href="/admin/orders" onClick={() => setNotificationsOpen(false)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                      View orders
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {notifications.summary.pendingOrders} orders, {notifications.summary.openTickets} support, {notifications.summary.openMessages} messages, {notifications.summary.pendingReviews} reviews need attention.
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.items.length ? notifications.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="flex gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.tone === "rose"
                            ? "bg-rose-500"
                            : item.tone === "blue"
                              ? "bg-blue-500"
                              : item.tone === "emerald"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                        }`} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">No new notifications.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 sm:flex">
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
