'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Images, Pencil, Trash2, Upload, X } from 'lucide-react'
import { deleteSlider, getSliders, saveSlider } from '@/services/contentService'
import { PRODUCT_IMAGE_BASE_URL } from '@/lib/apiConfig'
import { uploadImages } from '@/lib/upload'

const emptyForm = {
  title: '',
  subtitle: '',
  image_url: '',
  button_text: '',
  button_link: '',
  sort_order: 0,
  status: 'Active'
}

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return ''
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/')) return imageUrl
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${imageUrl}`
}

export default function SlidersPage() {
  const [sliders, setSliders] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => setSliders(await getSliders())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      let imageUrl = form.image_url

      if (imageFile) {
        const uploaded = await uploadImages([imageFile], { type: 'slideshow' })
        imageUrl = uploaded[0] || ''
      }

      if (!imageUrl) {
        setMessage('Please upload a slideshow image.')
        return
      }

      await saveSlider({ ...form, image_url: imageUrl, sort_order: Number(form.sort_order || 0) }, editId)
      setForm(emptyForm)
      setImageFile(null)
      setEditId(null)
      await load()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const edit = (slider) => {
    setEditId(slider.id)
    setForm({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      image_url: slider.image_url || '',
      button_text: slider.button_text || '',
      button_link: slider.button_link || '',
      sort_order: slider.sort_order || 0,
      status: slider.status || 'Active'
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <Images size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Homepage sliders</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {sliders.length ? sliders.map((slider) => (
            <article key={slider.id} className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Order {slider.sort_order}</p>
              <h3 className="mt-1 font-semibold text-slate-950">{slider.title || 'Untitled slide'}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{slider.subtitle}</p>
              {slider.image_url && (
                <div className="relative mt-3 aspect-video overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={getImageSrc(slider.image_url)}
                    alt={slider.title || 'Homepage slide'}
                    fill
                    sizes="320px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <p className="mt-3 truncate rounded bg-slate-50 p-2 text-xs text-slate-500">{slider.image_url}</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => edit(slider)} title="Edit"><Pencil size={16} /></button>
                <button onClick={() => deleteSlider(slider.id).then(load).catch((e) => setMessage(e.message))} className="text-red-600" title="Delete"><Trash2 size={16} /></button>
              </div>
            </article>
          )) : <p className="text-sm text-slate-500">No sliders yet.</p>}
        </div>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{editId ? `Edit slide #${editId}` : 'Add slide'}</h3>
          {editId && <button onClick={() => { setEditId(null); setForm(emptyForm); setImageFile(null) }}><X size={16} /></button>}
        </div>
        <form onSubmit={submit} className="space-y-3">
          {['title', 'subtitle', 'button_text', 'button_link'].map((field) => (
            <input
              key={field}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={field.replace('_', ' ')}
              className="w-full rounded-md border p-2"
            />
          ))}
          <label className="block cursor-pointer rounded-md border p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm">{imageFile?.name || form.image_url || 'Upload slideshow image'}</span>
              <Upload size={16} className="shrink-0" />
            </div>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </label>
          {form.image_url && !imageFile && (
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="slideshow/image.jpg"
              className="w-full rounded-md border p-2 text-xs"
            />
          )}
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full rounded-md border p-2" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border p-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button disabled={saving} className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save slide'}
          </button>
        </form>
      </aside>
    </div>
  )
}
