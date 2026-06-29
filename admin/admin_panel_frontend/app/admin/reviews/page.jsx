'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getReviews, updateReview } from '@/services/contentService'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [message, setMessage] = useState('')

  const load = async () => setReviews(await getReviews())

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const update = async (review, patch) => {
    const next = { ...review, ...patch }
    setReviews((items) => items.map((item) => item.id === review.id ? next : item))
    try {
      await updateReview(review.id, next)
    } catch (error) {
      setMessage(error.message)
      load().catch(() => {})
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><Star size={22} /> Reviews</h2>
        <p className="mt-1 text-sm text-slate-500">Approve, reject and reply to product reviews.</p>
      </div>
      {message && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {reviews.length ? reviews.map((review) => (
          <article key={review.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{review.product_name || `Product #${review.product_id}`}</h3>
                <p className="mt-1 text-sm text-slate-500">{review.reviewer_name} | {review.rating} stars</p>
              </div>
              <select value={review.status || 'Approved'} onChange={(e) => update(review, { status: e.target.value })} className="h-9 rounded-md border px-2 text-sm">
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            {review.title && <p className="mt-3 text-sm font-semibold text-slate-700">{review.title}</p>}
            <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{review.comment}</p>
            <textarea
              value={review.admin_reply || ''}
              onChange={(e) => setReviews((items) => items.map((item) => item.id === review.id ? { ...item, admin_reply: e.target.value } : item))}
              onBlur={(e) => update(review, { admin_reply: e.target.value })}
              placeholder="Admin reply"
              className="mt-3 min-h-24 w-full rounded-md border p-2 text-sm"
            />
          </article>
        )) : <p className="text-sm text-slate-500">No reviews yet.</p>}
      </div>
    </div>
  )
}
