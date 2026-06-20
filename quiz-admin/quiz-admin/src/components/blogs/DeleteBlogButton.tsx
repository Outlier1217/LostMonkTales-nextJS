'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'

export function DeleteBlogButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="danger" size="sm" onClick={handleDelete} loading={loading}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="w-3.5 h-3.5 text-red-400" />
    </Button>
  )
}