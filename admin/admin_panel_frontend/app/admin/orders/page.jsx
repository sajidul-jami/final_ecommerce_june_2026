'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, RefreshCw, Search, Trash2 } from 'lucide-react'
import { deleteOrder, getOrders, updateOrderStatus } from '@/services/orderService'

const statuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

const statusClass = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20'
}

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await getOrders())
    } catch (err) {
      setError(err.message || 'Unable to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialOrders = async () => {
      try {
        setOrders(await getOrders())
      } catch (err) {
        setError(err.message || 'Unable to load orders')
      } finally {
        setLoading(false)
      }
    }

    loadInitialOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    const normalized = query.toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = status === 'All' || order.order_status === status
      const matchesQuery =
        String(order.id).includes(normalized) ||
        (order.full_name || '').toLowerCase().includes(normalized) ||
        (order.payment_method || '').toLowerCase().includes(normalized)

      return matchesStatus && matchesQuery
    })
  }, [orders, query, status])

  const handleStatusChange = async (id, nextStatus) => {
    const previous = orders
    setOrders((current) => current.map((order) => order.id === id ? { ...order, order_status: nextStatus } : order))

    try {
      await updateOrderStatus(id, nextStatus)
    } catch (err) {
      setOrders(previous)
      setError(err.message || 'Unable to update order status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete order #${id}?`)) return

    const previous = orders
    setOrders((current) => current.filter((order) => order.id !== id))

    try {
      await deleteOrder(id)
    } catch (err) {
      setOrders(previous)
      setError(err.message || 'Unable to delete order')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Order management</h2>
          <p className="mt-1 text-sm text-slate-500">Track fulfillment, payments, and customer order status.</p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  status === item
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 lg:w-80">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order, customer, payment"
              className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length ? filteredOrders.map((order) => (
                <tr key={order.id} className="text-slate-700">
                  <td className="px-5 py-4 font-semibold text-slate-950">#{order.id}</td>
                  <td className="px-5 py-4">{order.full_name || 'Guest customer'}</td>
                  <td className="px-5 py-4">{order.payment_method}</td>
                  <td className="px-5 py-4 font-semibold">{money(order.total_amount)}</td>
                  <td className="px-5 py-4">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-4">
                    <select
                      value={order.order_status}
                      onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ring-1 outline-none ${statusClass[order.order_status] || statusClass.Pending}`}
                    >
                      {statuses.filter((item) => item !== 'All').map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/orders/${order.id}`} className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="View order">
                        <Eye size={16} />
                      </Link>
                      <button type="button" onClick={() => handleDelete(order.id)} className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Delete order">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
