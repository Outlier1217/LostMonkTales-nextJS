'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteArtworkButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    await fetch(`/api/art/${id}`, { method: 'DELETE' })
    // Hard redirect — router.push cache miss ho sakta hai
    window.location.href = '/admin/art'
  }

  if (confirm) return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Sure?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-600 text-white text-sm px-3 py-1.5
          rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Yes, Delete'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="border border-gray-700 text-gray-300 text-sm
          px-3 py-1.5 rounded-lg hover:bg-gray-800"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-red-400 border border-red-900
        text-sm px-3 py-1.5 rounded-lg hover:bg-red-900/20"
    >
      <Trash2 className="w-4 h-4" /> Delete
    </button>
  )
}