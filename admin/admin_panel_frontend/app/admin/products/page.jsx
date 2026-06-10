'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { PackagePlus, Pencil, Search, Trash2, Upload, X } from 'lucide-react'
import { addProduct, deleteProduct, getProducts, updateProduct } from '@/services/productService'
import { PRODUCT_IMAGE_BASE_URL } from '@/lib/apiConfig'
import { uploadProductImage } from '@/lib/upload'

const IMAGE_BASE = PRODUCT_IMAGE_BASE_URL

const emptyProduct = {
  category_id: '',
  name: '',
  sku: '',
  price: '',
  quantity: '',
  description: '',
  photo: null
}

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Number(value || 0))

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getProducts()
      setProducts(res)
    } catch (err) {
      setError(err.message || 'Unable to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase()

    return products.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      String(p.category_id || '').includes(q)
    )
  }, [products, query])

  const lowStockCount = products.filter(
    (p) => Number(p.quantity || 0) <= 10
  ).length

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value ?? ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!form.category_id || !form.name || form.price === '') {
        setError('Category, name and price are required')
        return
      }

      let fileName = typeof form.photo === 'string' ? form.photo : ''

      if (form.photo instanceof File) {
        fileName = await uploadProductImage(form.photo)
      }

      const payload = {
        name: form.name.trim(),
        sku: form.sku?.trim() || null,
        category_id: Number(form.category_id),
        price: Number(form.price),
        quantity: Number(form.quantity || 0),
        description: form.description,
        photo: fileName || 'noimage.jpg'
      }

      if (editId) {
        await updateProduct(editId, payload)
      } else {
        await addProduct(payload)
      }

      setForm(emptyProduct)
      setEditId(null)
      await loadProducts()

    } catch (err) {
      setError(err.message || 'Unable to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditId(product.id)
    setForm({
      category_id: product.category_id || '',
      name: product.name || '',
      sku: product.sku || '',
      price: product.price || '',
      quantity: product.quantity || '',
      description: product.description || '',
      photo: product.photo || ''
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm(emptyProduct)
  }

  const handleDelete = async (id) => {
    if (!confirm(`Delete product #${id}?`)) return

    const backup = products
    setProducts((p) => p.filter((x) => x.id !== id))

    try {
      await deleteProduct(id)
    } catch (err) {
      setProducts(backup)
      setError(err.message || 'Delete failed')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">

      <section className="space-y-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Product catalog</h2>
            <p className="text-sm text-slate-500">Manage inventory</p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm sm:gap-3">
            <div className="rounded border px-3 py-2 sm:p-3">
              Products: {products.length}
            </div>
            <div className="rounded border bg-amber-50 px-3 py-2 sm:p-3">
              Low stock: {lowStockCount}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded border bg-white">

          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold">Inventory</h3>

            <div className="flex w-full items-center rounded border bg-slate-50 px-3 py-2 sm:w-72">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ml-2 w-full min-w-0 bg-transparent outline-none"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Qty</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-5 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length ? (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {p.photo && (
                            <Image
                              src={`${IMAGE_BASE.replace(/\/$/, '')}/${p.photo}`}
                              alt={p.name || ''}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                              unoptimized
                            />
                          )}
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">{p.sku}</td>
                      <td className="px-3 py-3">#{p.category_id}</td>
                      <td className="px-3 py-3">{money(p.price)}</td>
                      <td className="px-3 py-3">{p.quantity}</td>

                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="mr-3 text-slate-700 hover:text-black"
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-5 text-center">
                      No products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </section>

      <aside className="rounded border bg-white p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">

        <div className="mb-4 flex items-center gap-2">
          <PackagePlus />
          <h3>{editId ? `Edit Product #${editId}` : 'Add Product'}</h3>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="ml-auto rounded border p-1 text-slate-500 hover:text-slate-950"
              title="Cancel edit"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2" />
          <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="w-full border p-2" />
          <input name="category_id" value={form.category_id} onChange={handleChange} placeholder="Category ID" className="w-full border p-2" />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2" />
          <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="w-full border p-2" />

          <label className="block cursor-pointer border p-2">
            <div className="flex justify-between gap-2">
              <span className="truncate">{form.photo?.name || form.photo || 'Browse image'}</span>
              <Upload size={16} className="shrink-0" />
            </div>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  photo: e.target.files?.[0] || null
                }))
              }
            />
          </label>

          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2" placeholder="Description" />

          <button disabled={saving} className="w-full bg-black p-2 text-white">
            {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
          </button>
        </form>

      </aside>

    </div>
  )
}
