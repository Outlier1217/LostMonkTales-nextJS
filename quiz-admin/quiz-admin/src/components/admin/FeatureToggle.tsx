'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

type FeatureToggleProps = {
  id: string
  featured: boolean
  endpoint: string
  method?: 'PATCH' | 'PUT'
}

export default function FeatureToggle({ id, featured, endpoint, method = 'PATCH' }: FeatureToggleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !featured }),
      })
      if (!response.ok) throw new Error('Unable to update homepage feature')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={featured}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        featured
          ? 'border-amber-300/30 bg-amber-300/10 text-amber-300 hover:bg-amber-300/20'
          : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
      }`}
    >
      <Sparkles className="h-3 w-3" />
      {loading ? 'Saving...' : featured ? 'On homepage' : 'Feature'}
    </button>
  )
}
