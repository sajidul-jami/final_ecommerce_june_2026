'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '../../services/authService'

export default function LoginPage() {

    const router = useRouter()

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // ✅ SAFE INPUT HANDLER
    const handleChange = (e) => {
        const { name, value } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: value ?? ''   // 🔥 prevents undefined issue
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (loading) return

        setLoading(true)
        setError('')

        try {

            const res = await loginAdmin(form)

            if (res?.success) {
                router.replace('/admin/dashboard')
            } else {
                setError(res?.message || 'Login failed')
            }

        } catch (err) {
            setError(err?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow sm:p-8"
            >

                <h1 className="text-2xl font-bold mb-6 text-center">
                    Admin Login
                </h1>

                {/* EMAIL */}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email ?? ''}   // 🔥 safe fallback
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />

                {/* PASSWORD */}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password ?? ''} // 🔥 safe fallback
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />

                {/* ERROR */}
                {error && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                {/* BUTTON */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-3 rounded text-white transition
                        ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800'
                        }`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

            </form>

        </div>
    )
}