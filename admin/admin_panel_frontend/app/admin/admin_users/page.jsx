'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Mail,
  Phone,
  Search,
  Shield,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'

import {
  getAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin
} from '@/services/authService'

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  role: 'Manager',
  status: 'active',
  password: ''
}

export default function AdminsPage() {

  const [admins, setAdmins] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // ======================
  // LOAD ADMINS (FIXED ESLINT WARNING)
  // ======================
  useEffect(() => {
    let ignore = false

    const fetchAdmins = async () => {
      try {
        setLoading(true)

        const data = await getAdmins()

        if (!ignore) {
          setAdmins(data || [])
        }

      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Unable to load admins')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchAdmins()

    return () => {
      ignore = true
    }
  }, [])

  // ======================
  // FILTER
  // ======================
  const filteredAdmins = useMemo(() => {
    const q = query.toLowerCase()

    return admins.filter((a) =>
      (a.full_name || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q) ||
      (a.role || '').toLowerCase().includes(q) ||
      (a.status || '').toLowerCase().includes(q)
    )
  }, [admins, query])

  // ======================
  // CREATE
  // ======================
  const openCreate = () => {
    setForm(emptyForm)
    setEditId(null)
    setIsModalOpen(true)
  }

  // ======================
  // EDIT
  // ======================
  const openEdit = (admin) => {
    setForm({
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone || '',
      role: admin.role,
      status: admin.status || 'active',
      password: ''
    })

    setEditId(admin.id)
    setIsModalOpen(true)
  }

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setActionLoading(true)

      if (editId) {
        await updateAdmin(editId, form)
      } else {
        await registerAdmin(form)
      }

      setIsModalOpen(false)
      setForm(emptyForm)
      setEditId(null)

      const data = await getAdmins()
      setAdmins(data || [])

    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return

    try {
      setActionLoading(true)

      await deleteAdmin(id)

      const data = await getAdmins()
      setAdmins(data || [])

    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setActionLoading(false)
    }
  }

  // ======================
  // UI HELPERS
  // ======================
  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-50 text-red-700'
      case 'Manager':
        return 'bg-blue-50 text-blue-700'
      case 'Support':
        return 'bg-amber-50 text-amber-700'
      default:
        return 'bg-slate-50 text-slate-700'
    }
  }

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700'
      : 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            Admin Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage system admins
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded bg-black px-4 py-2 text-white"
        >
          <Plus size={16} />
          Add Admin
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="flex w-full items-center rounded border px-3 py-2 sm:w-80">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search admins"
          className="w-full px-2 outline-none"
        />
      </div>

      {/* LIST */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {loading ? (
          <p>Loading...</p>
        ) : filteredAdmins.length ? (
          filteredAdmins.map((admin) => (
            <div key={admin.id} className="rounded border p-4">

              <div className="flex justify-between">

                <div>
                  <h4 className="font-semibold">{admin.full_name}</h4>
                  <p className="text-xs text-gray-500">#{admin.id}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className={`rounded px-2 py-1 text-xs ${getRoleColor(admin.role)}`}>
                    {admin.role}
                  </span>

                  <span className={`rounded px-2 py-1 text-xs ${getStatusColor(admin.status)}`}>
                    {admin.status}
                  </span>
                </div>

              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p className="flex gap-2"><Mail size={14} /> {admin.email}</p>
                <p className="flex gap-2"><Phone size={14} /> {admin.phone || 'N/A'}</p>
                <p className="flex gap-2"><Shield size={14} /> {admin.status}</p>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2">

                <button
                  onClick={() => openEdit(admin)}
                  className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                >
                  <Edit3 size={14} /> Edit
                </button>

                <button
                  onClick={() => handleDelete(admin.id)}
                  className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                >
                  <Trash2 size={14} /> Delete
                </button>

              </div>

            </div>
          ))
        ) : (
          <p>No admins found</p>
        )}

      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">

          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-lg bg-white p-5 shadow-xl"
          >

            <h3 className="text-lg font-semibold">
              {editId ? 'Edit Admin' : 'Create Admin'}
            </h3>

            <input
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border p-2"
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border p-2"
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border p-2"
            />

            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border p-2"
            />

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border p-2"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Manager">Manager</option>
              <option value="Support">Support</option>
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>

              <button
                disabled={actionLoading}
                className="rounded bg-black px-4 py-1 text-white"
              >
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  )
}