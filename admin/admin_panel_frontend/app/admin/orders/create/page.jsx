'use client'

import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'

export default function CreateOrderPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <ClipboardList size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Create order</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The backend currently accepts order creation with customer ID, total amount, payment method, and status.
              Product line item creation is not exposed yet, so this screen is reserved until that API is added.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
