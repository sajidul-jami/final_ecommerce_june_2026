'use client'

import { useEffect, useState } from 'react'
import { BadgePercent, Pencil, Trash2, X } from 'lucide-react'
import { deleteOffer, getOffers, saveOffer } from '@/services/contentService'
import { getProducts } from '@/services/productService'

const emptyForm = {
  title: '',
  product_id: '',
  discount_type: 'Percentage',
  discount_value: '',
  start_date: '',
  end_date: '',
  status: 'Active'
}

export default function OffersPage() {
  const [offers, setOffers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setOffers(await getOffers())
    setProducts(await getProducts())
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveOffer({ ...form, product_id: Number(form.product_id), discount_value: Number(form.discount_value || 0) }, editId)
      setForm(emptyForm)
      setEditId(null)
      await load()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const edit = (offer) => {
    setEditId(offer.id)
    setForm({
      title: offer.title || '',
      product_id: offer.product_id || '',
      discount_type: offer.discount_type || 'Percentage',
      discount_value: offer.discount_value || '',
      start_date: offer.start_date ? String(offer.start_date).slice(0, 16) : '',
      end_date: offer.end_date ? String(offer.end_date).slice(0, 16) : '',
      status: offer.status || 'Active'
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <BadgePercent size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Offers</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers.length ? offers.map((offer) => (
                <tr key={offer.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-semibold">{offer.title || 'Untitled offer'}</td>
                  <td className="px-3 py-3">{offer.product_name || `#${offer.product_id}`}</td>
                  <td className="px-3 py-3">{offer.discount_value} {offer.discount_type}</td>
                  <td className="px-3 py-3">{offer.status}</td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => edit(offer)} className="mr-3 text-slate-700" title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => deleteOffer(offer.id).then(load).catch((e) => setMessage(e.message))} className="text-red-600" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="p-5 text-center text-slate-500">No offers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{editId ? `Edit offer #${editId}` : 'Add offer'}</h3>
          {editId && <button onClick={() => { setEditId(null); setForm(emptyForm) }}><X size={16} /></button>}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Offer title" className="w-full rounded-md border p-2" />
          <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full rounded-md border p-2" required>
            <option value="">Select product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="rounded-md border p-2">
              <option>Percentage</option>
              <option>Flat</option>
            </select>
            <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="Value" className="rounded-md border p-2" />
          </div>
          <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-md border p-2" />
          <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-md border p-2" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border p-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button disabled={saving} className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white">{saving ? 'Saving...' : 'Save offer'}</button>
        </form>
      </aside>
    </div>
  )
}
