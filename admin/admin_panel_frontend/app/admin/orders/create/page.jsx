'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardList, Save } from 'lucide-react'
import { getCustomers } from '@/services/customerService'
import { createOrder } from '@/services/orderService'

const emptyForm = {
  customer_id: '',
  total_amount: '',
  payment_method: 'Cash On Delivery',
  order_status: 'Pending'
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((error) => {
        setMessageType('error')
        setMessage(error.message || 'Unable to load customers')
      })
      .finally(() => setLoading(false))
  }, [])

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setMessageType('success')

    try {
      const payload = {
        ...form,
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        total_amount: Number(form.total_amount || 0)
      }

      if (!payload.total_amount || payload.total_amount <= 0) {
        throw new Error('Total amount must be greater than 0.')
      }

      const result = await createOrder(payload)
      const orderId = result.order_id || result.id

      setMessageType('success')
      setMessage(`Order #${orderId} created successfully.`)

      if (orderId) {
        setTimeout(() => router.push(`/admin/orders/${orderId}`), 500)
      } else {
        setForm(emptyForm)
      }
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || 'Unable to create order')
    } finally {
      setSaving(false)
    }
  }

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
              Create a manual order for phone, Messenger, WhatsApp, or support-assisted sales.
            </p>
          </div>
        </div>

        {message && (
          <p className={`mt-5 rounded-md p-3 text-sm font-semibold ${
            messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
          }`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label>
            <span className="text-sm font-semibold text-slate-700">Customer</span>
            <select
              value={form.customer_id}
              onChange={(event) => updateField('customer_id', event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
            >
              <option value="">Guest / walk-in customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name || customer.user_name || customer.email || `Customer #${customer.id}`}
                </option>
              ))}
            </select>
            {loading && <span className="mt-1 block text-xs text-slate-500">Loading customers...</span>}
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Total Amount</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.total_amount}
              onChange={(event) => updateField('total_amount', event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-slate-700">Payment Method</span>
              <select
                value={form.payment_method}
                onChange={(event) => updateField('payment_method', event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
              >
                <option>Cash On Delivery</option>
                <option>Card</option>
                <option>Bkash</option>
                <option>Nagad</option>
              </select>
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-700">Order Status</span>
              <select
                value={form.order_status}
                onChange={(event) => updateField('order_status', event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </label>
          </div>

          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            <Save size={18} />
            {saving ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </section>
    </div>
  )
}
