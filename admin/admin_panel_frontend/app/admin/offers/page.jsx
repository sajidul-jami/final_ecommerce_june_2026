'use client'

import { useEffect, useMemo, useState } from 'react'
import { BadgePercent, Pencil, Trash2, X } from 'lucide-react'
import { deleteOffer, getOffers, saveOffer } from '@/services/contentService'
import { getProducts } from '@/services/productService'

const offerTypes = [
  'Flash Sale',
  'Eid Offer',
  'Weekend Deal',
  'Clearance Sale',
  'New Arrival Deal',
  'Special Offers'
]

const emptyForm = {
  title: '',
  offer_type: 'Flash Sale',
  badge_text: '',
  product_id: '',
  product_ids: [],
  discount_type: 'Percentage',
  discount_value: '',
  start_date: '',
  end_date: '',
  duration: '7',
  sort_order: 0,
  status: 'Active'
}

const taka = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0
})

const formatDateTimeLocal = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const applyDuration = (value) => {
  if (value === 'custom') return null
  if (value === 'none') return { start_date: '', end_date: '' }

  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + Number(value || 7))
  end.setHours(23, 59, 0, 0)

  return {
    start_date: formatDateTimeLocal(now),
    end_date: formatDateTimeLocal(end)
  }
}

const calculateOfferPrice = (price, type, value) => {
  const regular = Number(price || 0)
  const discount = Math.max(Number(value || 0), 0)
  const save = type === 'Percentage' ? regular * Math.min(discount, 100) / 100 : discount
  return Math.max(Math.round(regular - save), 0)
}

export default function OffersPage() {
  const [offers, setOffers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const load = async () => {
    const [offerRows, productRows] = await Promise.all([getOffers(), getProducts()])
    setOffers(offerRows)
    setProducts(productRows)
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    const rows = term
      ? products.filter((product) =>
          [product.name, product.sku, product.category_name]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        )
      : products

    return rows.slice(0, 80)
  }, [products, productSearch])

  const selectedProducts = useMemo(
    () => products.filter((product) => form.product_ids.includes(Number(product.id))),
    [products, form.product_ids]
  )
  const activeOfferProductMap = useMemo(() => {
    const map = new Map()
    offers.forEach((offer) => {
      if (offer.status === 'Active' && (!editId || Number(offer.id) !== Number(editId))) {
        map.set(Number(offer.product_id), offer)
      }
    })
    return map
  }, [offers, editId])

  const updateForm = (updates) => setForm((current) => ({ ...current, ...updates }))

  const toggleProduct = (id) => {
    const productId = Number(id)
    if (activeOfferProductMap.has(productId)) return

    if (editId) {
      updateForm({ product_ids: [productId], product_id: productId })
      return
    }

    const nextProductIds = form.product_ids.includes(productId)
      ? form.product_ids.filter((item) => item !== productId)
      : [...form.product_ids, productId]

    updateForm({
      product_ids: nextProductIds,
      product_id: nextProductIds[0] || ''
    })
  }

  const setDuration = (value) => {
    const dates = applyDuration(value)
    updateForm(dates ? { duration: value, ...dates } : { duration: value })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const productIds = editId
        ? [Number(form.product_id || form.product_ids[0])].filter(Boolean)
        : form.product_ids

      await saveOffer(
        {
          ...form,
          title: form.title || form.offer_type,
          product_id: productIds[0],
          product_ids: productIds,
          discount_value: Number(form.discount_value || 0),
          sort_order: Number(form.sort_order || 0)
        },
        editId
      )
      setForm(emptyForm)
      setProductSearch('')
      setEditId(null)
      await load()
      setMessage(editId ? 'Offer updated.' : 'Offer saved.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const edit = (offer) => {
    const productId = Number(offer.product_id)
    setEditId(offer.id)
    setForm({
      title: offer.title || '',
      offer_type: offer.offer_type || offer.title || 'Special Offers',
      badge_text: offer.badge_text || '',
      product_id: productId,
      product_ids: productId ? [productId] : [],
      discount_type: offer.discount_type || 'Percentage',
      discount_value: offer.discount_value || '',
      start_date: offer.start_date ? String(offer.start_date).slice(0, 16) : '',
      end_date: offer.end_date ? String(offer.end_date).slice(0, 16) : '',
      duration: 'custom',
      sort_order: offer.sort_order || 0,
      status: offer.status || 'Active'
    })
  }

  const resetForm = () => {
    setEditId(null)
    setForm(emptyForm)
    setProductSearch('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <BadgePercent size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Offers</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-3">Campaign</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Ends</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers.length ? offers.map((offer) => (
                <tr key={offer.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <p className="font-semibold">{offer.offer_type || offer.title || 'Special Offers'}</p>
                    <p className="text-xs text-slate-500">{offer.title || 'Untitled offer'}</p>
                  </td>
                  <td className="px-3 py-3">{offer.product_name || `#${offer.product_id}`}</td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-rose-600">{taka.format(Number(offer.offer_price || offer.price || 0))}</p>
                    {Number(offer.offer_price || 0) < Number(offer.price || 0) && (
                      <p className="text-xs text-slate-400 line-through">{taka.format(Number(offer.price || 0))}</p>
                    )}
                  </td>
                  <td className="px-3 py-3">{offer.discount_value} {offer.discount_type}</td>
                  <td className="px-3 py-3">{offer.end_date ? String(offer.end_date).slice(0, 10) : 'No expiry'}</td>
                  <td className="px-3 py-3">{offer.status}</td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => edit(offer)} className="mr-3 text-slate-700" title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => deleteOffer(offer.id).then(load).catch((e) => setMessage(e.message))} className="text-red-600" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="p-5 text-center text-slate-500">No offers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{editId ? `Edit offer #${editId}` : 'Add offer'}</h3>
          {editId && <button onClick={resetForm}><X size={16} /></button>}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <select value={form.offer_type} onChange={(e) => updateForm({ offer_type: e.target.value })} className="w-full rounded-md border p-2">
            {offerTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          <input value={form.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="Campaign title, optional" className="w-full rounded-md border p-2" />
          <input value={form.badge_text} onChange={(e) => updateForm({ badge_text: e.target.value })} placeholder="Badge text, optional" className="w-full rounded-md border p-2" />

          {!editId && (
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Find products"
              className="w-full rounded-md border p-2"
            />
          )}

          <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200">
            {filteredProducts.map((product) => (
              <label
                key={product.id}
                className={`flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 ${activeOfferProductMap.has(Number(product.id)) ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'cursor-pointer'}`}
              >
                <input
                  type={editId ? 'radio' : 'checkbox'}
                  checked={form.product_ids.includes(Number(product.id))}
                  disabled={activeOfferProductMap.has(Number(product.id))}
                  onChange={() => toggleProduct(product.id)}
                />
                <span className="min-w-0 flex-1 truncate">{product.name}</span>
                {activeOfferProductMap.has(Number(product.id)) && (
                  <span className="shrink-0 text-xs font-semibold text-amber-600">
                    In {activeOfferProductMap.get(Number(product.id))?.offer_type || 'offer'}
                  </span>
                )}
                <span className="shrink-0 text-xs font-semibold text-slate-500">{taka.format(Number(product.price || 0))}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={form.discount_type} onChange={(e) => updateForm({ discount_type: e.target.value })} className="rounded-md border p-2">
              <option>Percentage</option>
              <option>Flat</option>
            </select>
            <input type="number" min="0" value={form.discount_value} onChange={(e) => updateForm({ discount_value: e.target.value })} placeholder="Value" className="rounded-md border p-2" required />
          </div>

          <select value={form.duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-md border p-2">
            <option value="none">No expiry</option>
            <option value="1">Today</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="15">15 days</option>
            <option value="30">30 days</option>
            <option value="custom">Custom time</option>
          </select>

          {form.duration === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <input type="datetime-local" value={form.start_date} onChange={(e) => updateForm({ start_date: e.target.value })} className="w-full rounded-md border p-2 text-xs" />
              <input type="datetime-local" value={form.end_date} onChange={(e) => updateForm({ end_date: e.target.value })} className="w-full rounded-md border p-2 text-xs" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={form.sort_order} onChange={(e) => updateForm({ sort_order: e.target.value })} placeholder="Sort" className="rounded-md border p-2" />
            <select value={form.status} onChange={(e) => updateForm({ status: e.target.value })} className="rounded-md border p-2">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {selectedProducts.length > 0 && (
            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-2 font-semibold text-slate-800">Preview: {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''}</p>
              {selectedProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex justify-between gap-2 py-1">
                  <span className="truncate">{product.name}</span>
                  <span className="font-bold text-rose-600">{taka.format(calculateOfferPrice(product.price, form.discount_type, form.discount_value))}</span>
                </div>
              ))}
            </div>
          )}

          <button disabled={saving || form.product_ids.length === 0} className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving...' : editId ? 'Update offer' : 'Save offer'}
          </button>
        </form>
      </aside>
    </div>
  )
}
