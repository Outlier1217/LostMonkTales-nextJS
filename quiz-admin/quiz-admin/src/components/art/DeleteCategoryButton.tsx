'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteCategoryButton({ id, count }: { id: string; count: number }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await fetch(`/api/art-categories/${id}`, { method: 'DELETE' })
    window.location.href = '/admin/art/categories'
  }

  if (count > 0) return (
    <span className="text-xs text-gray-600 italic">
      {count} artwork{count !== 1 ? 's' : ''} — delete them first
    </span>
  )

  if (confirm) return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-600 text-white text-xs px-3 py-1.5
          rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="border border-gray-700 text-gray-300 text-xs
          px-3 py-1.5 rounded-lg hover:bg-gray-800"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-red-400 hover:text-red-300 p-1.5
        border border-transparent hover:border-red-900 rounded-lg"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}