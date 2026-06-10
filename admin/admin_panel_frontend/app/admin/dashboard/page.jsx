'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Banknote, Boxes, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { getOrders } from '@/services/orderService'
import { getProducts } from '@/services/productService'
import { getSalesSummary, getRecentSales } from '@/services/salesService'

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))

const statusClass = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20'
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [orderData, productData, salesData, recentData] = await Promise.all([
          getOrders(),
          getProducts(),
          getSalesSummary(),
          getRecentSales()
        ])

        setOrders(orderData)
        setProducts(productData)
        setSummary(salesData)
        setRecentSales(recentData)
      } catch (err) {
        setError(err.message || 'Unable to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.order_status === 'Completed')
    const revenue = summary?.total_sales ?? completed.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    const lowStock = products.filter((product) => Number(product.stock || 0) <= 10)

    return [
      { label: 'Total revenue', value: money(revenue), icon: Banknote, tone: 'bg-emerald-600' },
      { label: 'Orders', value: orders.length, icon: ShoppingCart, tone: 'bg-slate-900' },
      { label: 'Products', value: products.length, icon: Boxes, tone: 'bg-indigo-600' },
      { label: 'Low stock', value: lowStock.length, icon: AlertTriangle, tone: 'bg-amber-500' }
    ]
  }, [orders, products, summary])

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 5)
  }, [products])

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-md text-white ${item.tone}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Recent orders</h2>
              <p className="text-sm text-slate-500">Newest customer activity from the store.</p>
            </div>
            <TrendingUp className="text-slate-400" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="text-slate-700">
                    <td className="px-5 py-4 font-semibold text-slate-950">#{order.id}</td>
                    <td className="px-5 py-4">{order.full_name || 'Guest customer'}</td>
                    <td className="px-5 py-4">{order.payment_method}</td>
                    <td className="px-5 py-4 font-medium">{money(order.total_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass[order.order_status] || statusClass.Pending}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">High-value products</h2>
              <Boxes size={20} className="text-slate-400" />
            </div>
            <div className="mt-4 space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.product_name}</p>
                    <p className="text-xs text-slate-500">SKU {product.sku || 'N/A'} · Stock {product.stock ?? 0}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-950">{money(product.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Recent sales</h2>
              <Users size={20} className="text-slate-400" />
            </div>
            <div className="mt-4 space-y-4">
              {recentSales.length ? recentSales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sale.full_name || 'Customer'}</p>
                    <p className="text-xs text-slate-500">Order #{sale.id}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">{money(sale.total_amount)}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No completed sales yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
