'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/art/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !published }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg flex-1
        justify-center border transition-colors
        ${published
          ? 'text-green-600 border-green-200 hover:bg-green-50'
          : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
    >
      {published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {loading ? '...' : published ? 'Published' : 'Unpublish'}
    </button>
  )
}