'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, MapPin, Phone, Search, Users } from 'lucide-react'
import { getCustomers } from '@/services/customerService'

export default function UsersPage() {
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setCustomers(await getCustomers())
      } catch (err) {
        setError(err.message || 'Unable to load customers')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const normalized = query.toLowerCase()

    return customers.filter((customer) =>
      (customer.full_name || '').toLowerCase().includes(normalized) ||
      (customer.email || '').toLowerCase().includes(normalized) ||
      (customer.phone || '').toLowerCase().includes(normalized) ||
      (customer.city || '').toLowerCase().includes(normalized)
    )
  }, [customers, query])

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Customers</h2>
          <p className="mt-1 text-sm text-slate-500">View customer contact details and order-ready profiles.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-500">Total customers</p>
          <p className="text-2xl font-semibold text-slate-950">{customers.length}</p>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-400" />
            <h3 className="font-semibold text-slate-950">Customer directory</h3>
          </div>
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:w-80">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers"
              className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading customers...</p>
          ) : filteredCustomers.length ? filteredCustomers.map((customer) => (
            <article key={customer.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-950">{customer.full_name || 'Unnamed customer'}</h4>
                  <p className="mt-1 text-xs text-slate-500">Customer #{customer.id}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                  Active
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail size={15} /> {customer.email || 'No email'}</p>
                <p className="flex items-center gap-2"><Phone size={15} /> {customer.phone || 'No phone'}</p>
                <p className="flex items-center gap-2"><MapPin size={15} /> {[customer.address, customer.city].filter(Boolean).join(', ') || 'No address'}</p>
              </div>
            </article>
          )) : (
            <p className="text-sm text-slate-500">No customers found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
