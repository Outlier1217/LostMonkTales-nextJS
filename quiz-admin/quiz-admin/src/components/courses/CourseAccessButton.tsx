'use client'

import { useState } from 'react'

export default function CourseAccessButton({ courseId, paid, hasAccess }: { courseId: string; paid: boolean; hasAccess: boolean }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  if (!paid || hasAccess) return null
  async function requestAccess() {
    setLoading(true); setMessage('')
    const response = await fetch(`/api/courses/${courseId}/order`, { method: 'POST' })
    const data = await response.json()
    setLoading(false)
    setMessage(response.ok ? 'Request submitted. Access will be enabled after payment verification.' : data.error || 'Unable to submit request.')
  }
  return <div className="mt-4"><button onClick={requestAccess} disabled={loading} className="rounded-full bg-[#171310] px-5 py-3 text-sm text-white">{loading ? 'Submitting…' : 'Request paid access'}</button>{message && <p className="mt-2 text-sm text-[#685e55]">{message}</p>}</div>
}
