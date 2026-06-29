'use client'

import { useEffect, useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { getSupportTickets, updateSupportTicket } from '@/services/contentService'

export default function SupportPage() {
  const [tickets, setTickets] = useState([])
  const [message, setMessage] = useState('')

  const load = async () => setTickets(await getSupportTickets())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const update = async (ticket, patch) => {
    const next = { ...ticket, ...patch }
    setTickets((items) => items.map((item) => item.id === ticket.id ? next : item))
    try {
      await updateSupportTicket(ticket.id, next)
    } catch (error) {
      setMessage(error.message)
      load().catch(() => {})
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><LifeBuoy size={22} /> Support</h2>
        <p className="mt-1 text-sm text-slate-500">Manage customer support requests.</p>
      </div>
      {message && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {tickets.length ? tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{ticket.subject}</h3>
                <p className="mt-1 text-sm text-slate-500">{ticket.name} | {ticket.phone_number} | {ticket.email || 'No email'}</p>
              </div>
              <select value={ticket.status || 'Open'} onChange={(e) => update(ticket, { status: e.target.value })} className="h-9 rounded-md border px-2 text-sm">
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{ticket.message}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
              <select value={ticket.priority || 'Medium'} onChange={(e) => update(ticket, { priority: e.target.value })} className="rounded-md border p-2 text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input
                value={ticket.admin_note || ''}
                onChange={(e) => setTickets((items) => items.map((item) => item.id === ticket.id ? { ...item, admin_note: e.target.value } : item))}
                onBlur={(e) => update(ticket, { admin_note: e.target.value })}
                placeholder="Admin note"
                className="rounded-md border p-2 text-sm"
              />
            </div>
          </article>
        )) : <p className="text-sm text-slate-500">No support tickets.</p>}
      </div>
    </div>
  )
}
