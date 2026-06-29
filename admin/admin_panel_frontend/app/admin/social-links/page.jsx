'use client'

import { useEffect, useState } from 'react'
import { Share2, Trash2 } from 'lucide-react'
import { deleteSocialLink, getSocialLinks, saveSocialLink } from '@/services/contentService'

const emptyForm = { platform: '', url: '', icon: '', sort_order: 0, status: 'Active' }

export default function SocialLinksPage() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  const load = async () => setLinks(await getSocialLinks())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await saveSocialLink({ ...form, sort_order: Number(form.sort_order || 0) })
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
          <Share2 size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Social links</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="grid gap-3 p-4 md:grid-cols-2">
          {links.length ? links.map((link) => (
            <article key={link.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="font-semibold">{link.platform}</p>
                <p className="truncate text-sm text-slate-500">{link.url}</p>
              </div>
              <button onClick={() => deleteSocialLink(link.id).then(load).catch((e) => setMessage(e.message))} className="text-red-600"><Trash2 size={16} /></button>
            </article>
          )) : <p className="text-sm text-slate-500">No social links yet.</p>}
        </div>
      </section>
      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-semibold">Add social link</h3>
        <form onSubmit={submit} className="space-y-3">
          {['platform', 'url', 'icon'].map((field) => (
            <input key={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={field} required={field !== 'icon'} className="w-full rounded-md border p-2" />
          ))}
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full rounded-md border p-2" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border p-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="w-full rounded-md bg-slate-950 p-2 font-semibold text-white">Save link</button>
        </form>
      </aside>
    </div>
  )
}
