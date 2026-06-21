'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteCategoryButton({ id, count }: { id: string; count: number }) {
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    await fetch(`/api/art-categories/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (count > 0) return (
    <span className="text-xs text-gray-400 italic">
      {count} artwork{count !== 1 ? 's' : ''} — delete them first
    </span>
  )

  if (confirm) return (
    <div className="flex items-center gap-2">
      <button onClick={handleDelete}
        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">
        Delete
      </button>
      <button onClick={() => setConfirm(false)}
        className="border text-xs px-3 py-1.5 rounded-lg">
        Cancel
      </button>
    </div>
  )

  return (
    <button onClick={() => setConfirm(true)}
      className="text-red-400 hover:text-red-600 p-1.5">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}