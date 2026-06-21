'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = `w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
  text-sm text-gray-100 placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`

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
          className="text-sm text-gray-400 hover:text-gray-200">
          ← Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-gray-100 mt-2">New Category</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name *
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            className={inputCls}
            placeholder="e.g. Watercolor, Digital Art, Oil Painting"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={inputCls}
            placeholder="Optional short description"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm
              font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
          <button
            onClick={() => router.back()}
            className="border border-gray-700 text-gray-300 px-6 py-2
              rounded-lg text-sm hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}