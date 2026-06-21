'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PORTRAIT_CATEGORIES } from '@/lib/portrait-categories'
import PortraitImageUploader from './PortraitImageUploader'

type PortraitCategoryValue = typeof PORTRAIT_CATEGORIES[number]['value']

interface PortraitFormProps {
  initialData?: {
    id: string
    title: string
    image: string
    category: PortraitCategoryValue
    isPublished: boolean
  }
}

export default function PortraitForm({ initialData }: PortraitFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [image, setImage] = useState(initialData?.image ?? '')
  const [category, setCategory] = useState<PortraitCategoryValue>(
    initialData?.category ?? PORTRAIT_CATEGORIES[0].value
  )
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !image) {
      alert('Title aur image dono required hain')
      return
    }

    setSaving(true)
    try {
      const url = initialData ? `/api/portraits/${initialData.id}` : '/api/portraits'
      const method = initialData ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, image, category, isPublished }),
      })

      if (!res.ok) throw new Error('Save failed')

      router.push('/admin/portraits')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Save failed, console check karo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Portrait of a Wanderer"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-600"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PortraitCategoryValue)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-600"
        >
          {PORTRAIT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Image</label>
        <PortraitImageUploader value={image} onChange={setImage} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="accent-violet-600"
        />
        Publish immediately
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : initialData ? 'Update Portrait' : 'Add Portrait'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/portraits')}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}