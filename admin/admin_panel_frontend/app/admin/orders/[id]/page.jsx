'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { getOrderById } from '@/services/orderService'

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))

export default function OrderDetailsPage({ params }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const resolvedParams = await params
        setOrder(await getOrderById(resolvedParams.id))
      } catch (err) {
        setError(err.message || 'Unable to load order')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [params])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft size={16} />
          Back to orders
        </Link>

        {!loading && !error && (
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Printer size={16} />
            Print
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading order...</div>
      ) : error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : (
        <section id="order-print-area" className="rounded-md border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-semibold text-slate-950">Order #{order.order_id}</h2>
            <p className="text-sm text-slate-500">{order.full_name} · {order.email}</p>
            {(order.phone || order.address) && (
              <p className="mt-1 text-sm text-slate-500">
                {[order.phone, order.address].filter(Boolean).join(' · ')}
              </p>
            )}
            {(order.delivery_city || order.delivery_area || order.order_notes || order.checkout_type === 'guest') && (
              <p className="mt-1 text-sm text-slate-500">
                {[
                  order.checkout_type === 'guest' ? 'Guest checkout' : '',
                  order.delivery_city,
                  order.delivery_area,
                  order.order_notes,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
            {order.created_at && (
              <p className="mt-1 text-xs text-slate-400">
                {new Date(order.created_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{money(order.total_amount)}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Payment</p>
              <p className="mt-1 font-semibold text-slate-950">{order.payment_method}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 font-semibold text-slate-950">{order.order_status}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">Items</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(order.items || []).map((item) => (
                    <tr key={`${item.product_id}-${item.product_name}`}>
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{money(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
