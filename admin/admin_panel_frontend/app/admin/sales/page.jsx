'use client'

import { useEffect, useMemo, useState } from 'react'
import { Banknote, CreditCard, Receipt, WalletCards } from 'lucide-react'
import { getPaymentAnalytics, getRecentSales, getSalesSummary } from '@/services/salesService'

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))

export default function SalesPage() {
  const [summary, setSummary] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [paymentAnalytics, setPaymentAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSales = async () => {
      try {
        const [summaryData, recentData, paymentData] = await Promise.all([
          getSalesSummary(),
          getRecentSales(),
          getPaymentAnalytics()
        ])

        setSummary(summaryData)
        setRecentSales(recentData)
        setPaymentAnalytics(paymentData.data || [])
      } catch (err) {
        setError(err.message || 'Unable to load sales')
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  const totals = useMemo(() => {
    const revenue = Number(summary?.total_sales || 0)
    const orderCount = paymentAnalytics.reduce((sum, item) => sum + Number(item.total_orders || 0), 0)
    const average = orderCount ? revenue / orderCount : 0

    return [
      { label: 'Completed revenue', value: money(revenue), icon: Banknote },
      { label: 'Completed orders', value: orderCount, icon: Receipt },
      { label: 'Average order value', value: money(average), icon: WalletCards }
    ]
  }, [summary, paymentAnalytics])

  const maxPayment = Math.max(...paymentAnalytics.map((item) => Number(item.total_sales || 0)), 1)

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading sales analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Sales analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Revenue, payment mix, and latest completed orders.</p>
      </div>

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        {totals.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">Payment methods</h3>
              <p className="text-sm text-slate-500">Completed revenue by method.</p>
            </div>
            <CreditCard className="text-slate-400" size={20} />
          </div>

          <div className="mt-6 space-y-5">
            {paymentAnalytics.length ? paymentAnalytics.map((item) => {
              const amount = Number(item.total_sales || 0)
              const percent = Math.round((amount / maxPayment) * 100)

              return (
                <div key={item.payment_method}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.payment_method}</span>
                    <span className="font-semibold text-slate-950">{money(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.total_orders} completed orders</p>
                </div>
              )
            }) : (
              <p className="text-sm text-slate-500">No completed payment data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-950">Recent completed sales</h3>
            <p className="text-sm text-slate-500">Latest paid or completed order activity.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.length ? recentSales.map((sale) => (
                  <tr key={sale.id} className="text-slate-700">
                    <td className="px-5 py-4 font-semibold text-slate-950">#{sale.id}</td>
                    <td className="px-5 py-4">{sale.full_name || 'Customer'}</td>
                    <td className="px-5 py-4 font-semibold">{money(sale.total_amount)}</td>
                    <td className="px-5 py-4">{sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-slate-500">No completed sales found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
