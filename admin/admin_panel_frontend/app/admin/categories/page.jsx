'use client'

import { useEffect, useMemo, useState } from 'react'
import { PackagePlus, Search, Trash2 } from 'lucide-react'

import {
    getCategories,
    addCategory,
    deleteCategory
} from '@/services/categoryService'

const emptyForm = {
    name: '',
    cat_slug: '',
    cat_code: '',
    parent_code: ''
}

export default function CategoryPage() {

    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // ================= LOAD =================
    const loadCategories = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await getCategories()
            setCategories(res)
        } catch (err) {
            setError(err.message || 'Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    // ================= FILTER =================
    const filtered = useMemo(() => {
        const q = query.toLowerCase()

        return categories.filter((c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.cat_code || '').includes(q)
        )
    }, [categories, query])

    // ================= INPUT =================
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            await addCategory({
                name: form.name,
                cat_slug: form.cat_slug,
                cat_code: form.cat_code,
                parent_code: form.parent_code || null
            })

            setForm(emptyForm)
            await loadCategories()

        } catch (err) {
            setError(err.message || 'Failed to save category')
        } finally {
            setSaving(false)
        }
    }

    // ================= DELETE =================
    const handleDelete = async (id) => {
        if (!confirm('Delete category?')) return

        const backup = categories
        setCategories((p) => p.filter((x) => x.id !== id))

        try {
            await deleteCategory(id)
        } catch (err) {
            setCategories(backup)
            setError(err.message || 'Delete failed')
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">

            {/* LEFT */}
            <section className="space-y-5">

                <div className="flex justify-between">
                    <div>
                        <h2 className="text-xl font-semibold sm:text-2xl">Categories</h2>
                        <p className="text-sm text-slate-500">
                            Manage category hierarchy (Main / Sub / Sub-sub)
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* TABLE */}
                <div className="border rounded bg-white">

                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold">Category List</h3>

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
                    <table className="w-full min-w-[520px] text-sm">

                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-3 py-3 text-left">Name</th>
                                <th className="px-3 py-3 text-left">Code</th>
                                <th className="px-3 py-3 text-left">Parent</th>
                                <th className="px-3 py-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-5 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filtered.length ? (
                                filtered.map((c) => (
                                    <tr key={c.id}>

                                        <td className="px-3 py-3 font-semibold">
                                            {c.name}
                                        </td>

                                        <td className="px-3 py-3">{c.cat_code}</td>
                                        <td className="px-3 py-3">{c.parent_code || '-'}</td>

                                        <td className="px-3 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-5 text-center">
                                        No categories
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                    </div>
                </div>
            </section>

            {/* RIGHT FORM */}
            <aside className="rounded border bg-white p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">

                <div className="flex items-center gap-2 mb-4">
                    <PackagePlus />
                    <h3>Add Category</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Category name"
                        className="border p-2 w-full"
                    />

                    <input
                        name="cat_slug"
                        value={form.cat_slug}
                        onChange={handleChange}
                        placeholder="Slug (electronics-mobile)"
                        className="border p-2 w-full"
                    />

                    <input
                        name="cat_code"
                        value={form.cat_code}
                        onChange={handleChange}
                        placeholder="Code (001 or 001-001)"
                        className="border p-2 w-full"
                    />

                    <input
                        name="parent_code"
                        value={form.parent_code}
                        onChange={handleChange}
                        placeholder="Parent Code (optional)"
                        className="border p-2 w-full"
                    />

                    <button
                        disabled={saving}
                        className="w-full bg-black text-white p-2"
                    >
                        {saving ? 'Saving...' : 'Add Category'}
                    </button>

                </form>

            </aside>

        </div>
    )
}