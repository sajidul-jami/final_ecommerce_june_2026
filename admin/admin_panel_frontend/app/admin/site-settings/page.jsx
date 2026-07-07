'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Save, Settings, Upload } from 'lucide-react'
import { getSiteSettings, saveSiteSettings } from '@/services/contentService'
import { PRODUCT_IMAGE_BASE_URL } from '@/lib/apiConfig'
import { uploadSiteAsset } from '@/lib/upload'

const emptySettings = {
  website_name: '',
  website_logo: '',
  footer_logo: '',
  favicon: '',
  website_description: '',
  footer_title: '',
  footer_description: '',
  footer_quick_links: '',
  contact_email: '',
  phone: '',
  whatsapp: '',
  office_address: '',
  google_map: '',
  support_email: '',
  footer_copyright: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  google_analytics: '',
  google_tag_manager: '',
  facebook_pixel: '',
  inside_dhaka_delivery_charge: '80',
  outside_dhaka_delivery_charge: '120'
}

const imageFields = [
  { key: 'website_logo', label: 'Website Logo' },
  { key: 'footer_logo', label: 'Footer Logo' },
  { key: 'favicon', label: 'Favicon' }
]

const textFields = [
  { key: 'website_name', label: 'Website Name' },
  { key: 'website_description', label: 'Website Description', multiline: true },
  { key: 'footer_title', label: 'Footer Title' },
  { key: 'footer_description', label: 'Footer Description', multiline: true },
  { key: 'footer_quick_links', label: 'Footer Quick Links (one per line: Label | URL)', multiline: true },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'office_address', label: 'Office Address', multiline: true },
  { key: 'google_map', label: 'Google Map', multiline: true },
  { key: 'support_email', label: 'Support Email' },
  { key: 'inside_dhaka_delivery_charge', label: 'Inside Dhaka Delivery Charge' },
  { key: 'outside_dhaka_delivery_charge', label: 'Outside Dhaka Delivery Charge' },
  { key: 'footer_copyright', label: 'Footer Copyright' },
  { key: 'meta_title', label: 'Meta Title' },
  { key: 'meta_description', label: 'Meta Description', multiline: true },
  { key: 'meta_keywords', label: 'Meta Keywords' },
  { key: 'google_analytics', label: 'Google Analytics', multiline: true },
  { key: 'google_tag_manager', label: 'Google Tag Manager', multiline: true },
  { key: 'facebook_pixel', label: 'Facebook Pixel', multiline: true }
]

const getImageSrc = (value) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value
  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${value}`
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(emptySettings)
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getSiteSettings()
      .then((data) => setSettings({ ...emptySettings, ...data }))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [])

  const updateField = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const payload = { ...settings }

      for (const field of imageFields) {
        if (files[field.key]) {
          payload[field.key] = await uploadSiteAsset(files[field.key], field.key)
        }
      }

      await saveSiteSettings(payload)
      setSettings({ ...emptySettings, ...payload })
      setFiles({})
      setMessage('Site settings saved.')
    } catch (error) {
      setMessage(error.message || 'Unable to save site settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading site settings...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <Settings size={18} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Site Settings</h2>
        </div>
        {message && <p className="m-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}

        <div className="grid gap-4 p-4 md:grid-cols-3">
          {imageFields.map((field) => {
            const preview = files[field.key] ? URL.createObjectURL(files[field.key]) : getImageSrc(settings[field.key])
            return (
              <div key={field.key} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-950">{field.label}</p>
                <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-md bg-slate-50">
                  {preview ? (
                    <Image src={preview} alt={field.label} width={180} height={100} className="max-h-24 w-auto object-contain" unoptimized />
                  ) : (
                    <span className="text-sm text-slate-400">No image</span>
                  )}
                </div>
                <label className="mt-3 block cursor-pointer rounded-md border p-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{files[field.key]?.name || settings[field.key] || `Upload ${field.label}`}</span>
                    <Upload size={16} className="shrink-0" />
                  </div>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(event) => setFiles((prev) => ({ ...prev, [field.key]: event.target.files?.[0] || null }))}
                  />
                </label>
                {(settings[field.key] || files[field.key]) && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField(field.key, '')
                      setFiles((prev) => ({ ...prev, [field.key]: null }))
                    }}
                    className="mt-2 w-full rounded-md border border-red-200 p-2 text-sm font-semibold text-red-600"
                  >
                    Remove {field.label}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {textFields.map((field) => (
            <label key={field.key} className={field.multiline ? 'md:col-span-2' : ''}>
              <span className="text-sm font-semibold text-slate-700">{field.label}</span>
              {field.multiline ? (
                <textarea
                  value={settings[field.key] || ''}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  className="mt-1 min-h-24 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
                />
              ) : (
                <input
                  value={settings[field.key] || ''}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-slate-950"
                />
              )}
            </label>
          ))}
        </div>
        <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Site Settings'}
        </button>
      </section>
    </form>
  )
}
