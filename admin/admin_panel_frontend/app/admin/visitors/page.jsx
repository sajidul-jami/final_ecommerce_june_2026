'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { getVisitorAnalytics } from '@/services/contentService'

const formatDate = (value) => {
  if (!value) return 'No date'
  return new Date(value).toLocaleString()
}

export default function VisitorsPage() {
  const [analytics, setAnalytics] = useState({ sessions: [], pages: [], sources: [] })
  const [message, setMessage] = useState('')

  useEffect(() => {
    getVisitorAnalytics()
      .then(setAnalytics)
      .catch((error) => setMessage(error.message))
  }, [])

  const totalSessions = analytics.sources.reduce((sum, item) => sum + Number(item.sessions || 0), 0)
  const totalViews = analytics.sources.reduce((sum, item) => sum + Number(item.page_views || 0), 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><Activity size={22} /> Visitors</h2>
        <p className="mt-1 text-sm text-slate-500">Track traffic source, IP address and page visits.</p>
      </div>

      {message && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Sessions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{totalSessions}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Page Views</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{totalViews}</p>
        </div>
        {analytics.sources.slice(0, 2).map((source) => (
          <div key={source.source} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm capitalize text-slate-500">{source.source || 'direct'}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{source.sessions}</p>
          </div>
        ))}
      </div>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-950">Traffic Sources</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3">Sessions</th>
                <th className="p-3">Page Views</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sources.length ? analytics.sources.map((source) => (
                <tr key={source.source} className="border-t">
                  <td className="p-3 capitalize">{source.source || 'direct'}</td>
                  <td className="p-3">{source.sessions}</td>
                  <td className="p-3">{source.page_views || 0}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="p-4 text-slate-500">No visitor data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-950">Recent Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3">IP</th>
                <th className="p-3">Views</th>
                <th className="p-3">First Page</th>
                <th className="p-3">Last Page</th>
                <th className="p-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sessions.length ? analytics.sessions.map((session) => (
                <tr key={session.session_id} className="border-t align-top">
                  <td className="p-3 capitalize">{session.source || 'direct'}</td>
                  <td className="p-3">{session.ip_address || '-'}</td>
                  <td className="p-3">{session.page_views || 0}</td>
                  <td className="max-w-[220px] truncate p-3">{session.first_page || '-'}</td>
                  <td className="max-w-[220px] truncate p-3">{session.last_page || '-'}</td>
                  <td className="p-3">{formatDate(session.last_seen)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-4 text-slate-500">No sessions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-950">Recent Page Visits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Page</th>
                <th className="p-3">Source</th>
                <th className="p-3">IP</th>
                <th className="p-3">Viewed</th>
              </tr>
            </thead>
            <tbody>
              {analytics.pages.length ? analytics.pages.map((page, index) => (
                <tr key={`${page.session_id}-${page.viewed_at}-${index}`} className="border-t">
                  <td className="max-w-[360px] truncate p-3">{page.page_title || page.page_url}</td>
                  <td className="p-3 capitalize">{page.source || 'direct'}</td>
                  <td className="p-3">{page.ip_address || '-'}</td>
                  <td className="p-3">{formatDate(page.viewed_at)}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-4 text-slate-500">No page visits yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
