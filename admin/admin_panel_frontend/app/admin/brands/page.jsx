'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Pencil, Tags, Trash2, Upload, X } from 'lucide-react'
import { deleteBrand, getBrands, saveBrand } from '@/services/contentService'
import { PRODUCT_IMAGE_BASE_URL } from '@/lib/apiConfig'
import { uploadBrandImage } from '@/lib/upload'

const emptyForm = {
  name: '',
  slug: '',
  logo: '',
  description: '',
  status: 'Active',
  seo_title: '',
  seo_description: '',
  seo_keywords: ''
}

const getImageSrc = (logo) => {
  if (!logo) return ''
  if (/^https?:\/\//i.test(logo) || logo.startsWith('/')) return logo
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${logo}`
}

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => setBrands(await getBrands())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : getImageSrc(form.logo)

  const resetForm = () => {
    setForm(emptyForm)
    setImageFile(null)
    setEditId(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const uploadedLogo = imageFile ? await uploadBrandImage(imageFile, form.name) : form.logo
      await saveBrand({ ...form, logo: uploadedLogo }, editId)
      resetForm()
      await load()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const editBrand = (brand) => {
    setEditId(brand.id)
    setImageFile(null)
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      logo: brand.logo || '',
      description: brand.description || '',
      status: brand.status || 'Active',
      seo_title: brand.seo_title || '',
      seo_description: brand.seo_description || '',
      seo_keywords: brand.seo_keywords || ''
    })
  }

  const removeBrand = async (id) => {
    if (!confirm(`Delete brand #${id}?`)) return

    try {
      await deleteBrand(id)
      if (editId === id) resetForm()
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <Tags size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Brands</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.length ? brands.map((brand) => (
            <article key={brand.id} className="flex gap-3 rounded-md border border-slate-200 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                {brand.logo ? (
                  <Image src={getImageSrc(brand.logo)} alt={brand.name || ''} width={56} height={56} className="h-full w-full object-contain" unoptimized />
                ) : (
                  <Tags size={20} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">{brand.name}</p>
                    <p className="truncate text-sm text-slate-500">{brand.slug || 'auto-slug'} | {brand.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editBrand(brand)} className="text-slate-700" title="Edit brand">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => removeBrand(brand.id)} className="text-red-600" title="Delete brand">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {brand.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{brand.description}</p>}
              </div>
            </article>
          )) : <p className="text-sm text-slate-500">No brands yet.</p>}
        </div>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold">{editId ? `Edit brand #${editId}` : 'Add brand'}</h3>
          {editId && (
            <button type="button" onClick={resetForm} className="ml-auto rounded border p-1 text-slate-500" title="Cancel edit">
              <X size={16} />
            </button>
          )}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand name" required className="w-full rounded-md border p-2" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (auto if empty)" className="w-full rounded-md border p-2" />

          {imagePreview && (
            <div className="overflow-hidden rounded-md border bg-slate-50 p-3">
              <Image src={imagePreview} alt="Brand preview" width={320} height={160} className="mx-auto max-h-40 w-auto object-contain" unoptimized />
            </div>
          )}
          <label className="block cursor-pointer rounded-md border p-2">
            <div className="flex justify-between gap-2">
              <span className="truncate">{imageFile?.name || form.logo || 'Upload brand image'}</span>
              <Upload size={16} className="shrink-0" />
            </div>
            <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>
          {(form.logo || imageFile) && (
            <button type="button" onClick={() => { setForm({ ...form, logo: '' }); setImageFile(null) }} className="w-full rounded-md border border-red-200 p-2 text-sm font-semibold text-red-600">
              Delete brand image
            </button>
          )}

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brand description" className="min-h-24 w-full rounded-md border p-2" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border p-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="SEO title" className="w-full rounded-md border p-2" />
          <textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder="SEO description" className="min-h-20 w-full rounded-md border p-2" />
          <input value={form.seo_keywords} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} placeholder="SEO keywords" className="w-full rounded-md border p-2" />
          <button disabled={saving} className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white">
            {saving ? 'Saving...' : editId ? 'Update brand' : 'Save brand'}
          </button>
        </form>
      </aside>
    </div>
  )
}
