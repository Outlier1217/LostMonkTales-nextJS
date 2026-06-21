'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name required'); return }
    setLoading(true)
    const res = await fetch('/api/art-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    setLoading(false)
    if (res.ok) router.push('/admin/art/categories')
    else {
      const d = await res.json()
      setError(d.error || 'Error creating category')
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/admin/art/categories"
          className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Categories
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Category</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            className="w-full border rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Watercolor, Digital Art, Oil Painting"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional short description"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm
              font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Category'}
          </button>
          <button onClick={() => router.back()}
            className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}