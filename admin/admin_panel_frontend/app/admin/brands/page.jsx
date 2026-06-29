'use client'

import { useEffect, useState } from 'react'
import { Tags, Trash2 } from 'lucide-react'
import { deleteBrand, getBrands, saveBrand } from '@/services/contentService'

const emptyForm = { name: '', slug: '', logo: '', status: 'Active' }

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  const load = async () => setBrands(await getBrands())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await saveBrand(form)
      setForm(emptyForm)
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <Tags size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Brands</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.length ? brands.map((brand) => (
            <article key={brand.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{brand.name}</p>
                <p className="truncate text-sm text-slate-500">{brand.slug || 'no-slug'} | {brand.status}</p>
              </div>
              <button onClick={() => deleteBrand(brand.id).then(load).catch((e) => setMessage(e.message))} className="text-red-600" title="Delete brand">
                <Trash2 size={16} />
              </button>
            </article>
          )) : <p className="text-sm text-slate-500">No brands yet.</p>}
        </div>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-semibold">Add brand</h3>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand name" required className="w-full rounded-md border p-2" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full rounded-md border p-2" />
          <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Logo URL/file" className="w-full rounded-md border p-2" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border p-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white">Save brand</button>
        </form>
      </aside>
    </div>
  )
}
