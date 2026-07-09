'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { getCustomerMessages, updateCustomerMessage } from '@/services/contentService'

const formatDate = (value) => {
  if (!value) return 'No date'
  return new Date(value).toLocaleString()
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [notice, setNotice] = useState('')

  const load = async () => setMessages(await getCustomerMessages())

  useEffect(() => {
    load().catch((error) => setNotice(error.message))
  }, [])

  const update = async (message, patch) => {
    const next = { ...message, ...patch }
    setMessages((items) => items.map((item) => item.id === message.id ? next : item))
    try {
      await updateCustomerMessage(message.id, next)
      setNotice('Message saved.')
    } catch (error) {
      setNotice(error.message)
      load().catch(() => {})
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><MessageSquare size={22} /> Messages</h2>
        <p className="mt-1 text-sm text-slate-500">Reply to customer messages from the storefront message button.</p>
      </div>

      {notice && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        {messages.length ? messages.map((item) => (
          <article key={item.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{item.subject}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {item.name || item.user_name || 'Customer'} | {item.phone} | {item.email || 'No email'}
                </p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(item.created_at)}</p>
              </div>
              <select
                value={item.status || 'Open'}
                onChange={(event) => update(item, { status: event.target.value })}
                className="h-9 rounded-md border px-2 text-sm"
              >
                <option>Open</option>
                <option>Replied</option>
                <option>Closed</option>
              </select>
            </div>

            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.message}</p>
            {item.page_url && <p className="mt-2 truncate text-xs text-slate-400">From: {item.page_url}</p>}

            <textarea
              value={item.admin_reply || ''}
              onChange={(event) => setMessages((items) => items.map((message) => (
                message.id === item.id ? { ...message, admin_reply: event.target.value } : message
              )))}
              onBlur={(event) => update(item, { admin_reply: event.target.value, status: event.target.value ? 'Replied' : item.status })}
              placeholder="Write admin reply. Customer can see it from message history using their phone number."
              className="mt-3 min-h-28 w-full rounded-md border p-2 text-sm"
            />
          </article>
        )) : <p className="text-sm text-slate-500">No customer messages yet.</p>}
      </div>
    </div>
  )
}
