'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function PublishToggle({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/portraits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      })
      if (!res.ok) throw new Error('Toggle failed')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        isPublished ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
      }`}
    >
      {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {isPublished ? 'Published' : 'Draft'}
    </button>
  )
}