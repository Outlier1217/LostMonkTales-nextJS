'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeletePortraitButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/portraits/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-400 hover:text-red-300 font-medium">
          {deleting ? '...' : 'Confirm?'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-500 hover:text-gray-400">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}