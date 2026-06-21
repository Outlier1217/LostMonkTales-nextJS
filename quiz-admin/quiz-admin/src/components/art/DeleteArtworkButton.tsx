'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteArtworkButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    await fetch(`/api/art/${id}`, { method: 'DELETE' })
    router.push('/admin/art')
  }

  if (confirm) return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Sure?</span>
      <button onClick={handleDelete}
        className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-600">
        Yes, Delete
      </button>
      <button onClick={() => setConfirm(false)}
        className="border text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50">
        Cancel
      </button>
    </div>
  )

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-red-500 border border-red-200
        text-sm px-3 py-1.5 rounded-lg hover:bg-red-50">
      <Trash2 className="w-4 h-4" /> Delete
    </button>
  )
}