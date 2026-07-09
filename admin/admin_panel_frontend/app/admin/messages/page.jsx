'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { getCustomerMessages, updateCustomerMessage } from '@/services/contentService'

const formatDate = (value) => {
  if (!value) return 'No date'
  return new Date(value).toLocaleString()
}

const conversationKey = (message) =>
  String(message.phone || message.user_id || message.email || message.id)

const customerName = (message) =>
  message.name || message.user_name || 'Customer'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [activeKey, setActiveKey] = useState('')
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    const rows = await getCustomerMessages()
    setMessages(rows)
    return rows
  }

  useEffect(() => {
    let active = true

    load()
      .then((rows) => {
        if (!active || activeKey) return
        const first = rows[0]
        if (first) setActiveKey(conversationKey(first))
      })
      .catch((error) => setNotice(error.message))

    const timer = setInterval(() => {
      load().catch(() => {})
    }, 10000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [activeKey])

  const conversations = useMemo(() => {
    const grouped = new Map()

    messages.forEach((message) => {
      const key = conversationKey(message)
      const current = grouped.get(key) || {
        key,
        customer: customerName(message),
        phone: message.phone || '',
        email: message.email || '',
        latest: message,
        openCount: 0,
        items: []
      }

      current.items.push(message)
      if (Number(message.id) > Number(current.latest.id)) current.latest = message
      if ((message.status || 'Open') === 'Open') current.openCount += 1
      grouped.set(key, current)
    })

    return Array.from(grouped.values())
      .map((conversation) => ({
        ...conversation,
        items: conversation.items.sort((a, b) => Number(a.id) - Number(b.id))
      }))
      .sort((a, b) => Number(b.latest.id) - Number(a.latest.id))
  }, [messages])

  useEffect(() => {
    if (activeKey || !conversations.length) return
    setActiveKey(conversations[0].key)
  }, [activeKey, conversations])

  const activeConversation = conversations.find((conversation) => conversation.key === activeKey) || conversations[0]

  const update = async (message, patch) => {
    const next = { ...message, ...patch }
    setMessages((items) => items.map((item) => item.id === message.id ? next : item))
    setSavingId(message.id)

    try {
      await updateCustomerMessage(message.id, next)
      setNotice('Reply saved.')
    } catch (error) {
      setNotice(error.message)
      load().catch(() => {})
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><MessageSquare size={22} /> Messages</h2>
        <p className="mt-1 text-sm text-slate-500">Customer conversations from the storefront message button.</p>
      </div>

      {notice && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {conversations.length ? (
        <div className="grid min-h-[680px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-4">
              <p className="font-semibold text-slate-950">Conversations</p>
              <p className="mt-1 text-xs text-slate-500">{conversations.length} customers</p>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2 lg:max-h-[620px]">
              {conversations.map((conversation) => (
                <button
                  key={conversation.key}
                  type="button"
                  onClick={() => setActiveKey(conversation.key)}
                  className={`mb-2 w-full rounded-md p-3 text-left transition ${
                    activeConversation?.key === conversation.key
                      ? 'bg-slate-950 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{conversation.customer}</p>
                      <p className={`mt-1 truncate text-xs ${activeConversation?.key === conversation.key ? 'text-slate-300' : 'text-slate-500'}`}>
                        {conversation.phone || conversation.email || 'No contact'}
                      </p>
                    </div>
                    {conversation.openCount > 0 && (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">{conversation.openCount}</span>
                    )}
                  </div>
                  <p className={`mt-2 line-clamp-2 text-xs ${activeConversation?.key === conversation.key ? 'text-slate-300' : 'text-slate-500'}`}>
                    {conversation.latest.message}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col">
            <div className="border-b border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{activeConversation.customer}</p>
              <p className="mt-1 text-sm text-slate-500">
                {activeConversation.phone || 'No phone'} {activeConversation.email ? `| ${activeConversation.email}` : ''}
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
              {activeConversation.items.map((item) => (
                <article key={item.id} className="space-y-3">
                  <div className="max-w-2xl rounded-2xl rounded-bl-md bg-white p-4 text-sm text-slate-700 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-950">{item.subject}</p>
                      <select
                        value={item.status || 'Open'}
                        onChange={(event) => update(item, { status: event.target.value })}
                        className="h-8 rounded-md border px-2 text-xs"
                      >
                        <option>Open</option>
                        <option>Replied</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <p className="mt-2 leading-6">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(item.created_at)}</p>
                    {item.page_url && <p className="mt-2 truncate text-xs text-slate-400">From: {item.page_url}</p>}
                  </div>

                  {item.admin_reply && (
                    <div className="ml-auto max-w-2xl rounded-2xl rounded-br-md bg-rose-600 p-4 text-sm font-semibold text-white shadow-sm">
                      {item.admin_reply}
                    </div>
                  )}

                  <div className="ml-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <textarea
                      value={item.admin_reply || ''}
                      onChange={(event) => setMessages((items) => items.map((message) => (
                        message.id === item.id ? { ...message, admin_reply: event.target.value } : message
                      )))}
                      placeholder="Write admin reply..."
                      className="min-h-20 w-full resize-none rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-rose-500"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => update(item, { status: item.admin_reply ? 'Replied' : item.status, admin_reply: item.admin_reply || '' })}
                        disabled={savingId === item.id}
                        className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                      >
                        {savingId === item.id ? 'Saving...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">No customer messages yet.</p>
      )}
    </div>
  )
}
