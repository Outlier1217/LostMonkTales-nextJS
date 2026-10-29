'use client'

import { useState } from 'react'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    if (!window.confirm('Delete this course and all of its content? This cannot be undone.')) return
    setDeleting(true)
    const response = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
    if (response.ok) {
      window.location.reload()
      return
    }
    const data = await response.json().catch(() => ({}))
    setDeleting(false)
    window.alert(data.error || 'Unable to delete course.')
  }

  return <button type="button" disabled={deleting} onClick={() => void remove()} className="ml-3 text-red-400 hover:text-red-300 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete'}</button>
}
