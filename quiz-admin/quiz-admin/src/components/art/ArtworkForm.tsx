'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from './ImageUploader'

interface Category { id: string; name: string }
interface Props {
  categories: Category[]
  initial?: {
    id?: string; title?: string; description?: string
    price?: number; contact?: string; images?: string[]
    categoryId?: string; isPublished?: boolean
  }
}

const inputCls = `w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
  text-sm text-gray-100 placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`

export default function ArtworkForm({ categories, initial = {} }: Props) {
  const router = useRouter()
  const isEdit = !!initial.id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    price: initial.price?.toString() || '',
    contact: initial.contact || '',
    categoryId: initial.categoryId || '',
    images: (initial.images as string[]) || [],
    isPublished: initial.isPublished || false,
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.contact || !form.categoryId) {
      alert('Title, price, contact aur category required hai')
      return
    }
    if (!form.images.length) {
      alert('Kam se kam ek image upload karo')
      return
    }
    setLoading(true)
    const url = isEdit ? `/api/art/${initial.id}` : '/api/art'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/admin/art')
    else alert('Error saving artwork')
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Images *</label>
        <ImageUploader value={form.images} onChange={v => set('images', v)} />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className={inputCls}
          placeholder="Artwork title"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
        <select
          value={form.categoryId}
          onChange={e => set('categoryId', e.target.value)}
          className={inputCls}
        >
          <option value="" className="bg-gray-800">Select category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id} className="bg-gray-800">{c.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          className={inputCls}
          placeholder="Artwork ke baare mein..."
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹) *</label>
        <input
          type="number"
          value={form.price}
          onChange={e => set('price', e.target.value)}
          className={inputCls}
          placeholder="2500"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Contact *</label>
        <input
          value={form.contact}
          onChange={e => set('contact', e.target.value)}
          className={inputCls}
          placeholder="WhatsApp number ya email"
        />
      </div>

      {/* Publish toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="publish"
          checked={form.isPublished}
          onChange={e => set('isPublished', e.target.checked)}
          className="w-4 h-4 accent-violet-500"
        />
        <label htmlFor="publish" className="text-sm text-gray-300">
          Publish immediately
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-medium
            hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Artwork' : 'Add Artwork'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-700 text-gray-300 px-6 py-2 rounded-lg
            text-sm hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}