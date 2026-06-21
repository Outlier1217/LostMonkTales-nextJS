'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Upload, X, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'RESIDENTIAL', label: 'Residential' },
]

type ArchitectureProject = {
  id: string
  title: string
  description: string | null
  location: string | null
  size: string | null
  price: string | null
  category: string
  images: string[]
  isPublished: boolean
}

export function ArchitectureForm({ project }: { project?: ArchitectureProject }) {
  const router = useRouter()
  const isEdit = !!project

  const [title, setTitle] = useState(project?.title || '')
  const [description, setDescription] = useState(project?.description || '')
  const [location, setLocation] = useState(project?.location || '')
  const [size, setSize] = useState(project?.size || '')
  const [price, setPrice] = useState(project?.price || '')
  const [category, setCategory] = useState(project?.category || 'RESIDENTIAL')
  const [images, setImages] = useState<string[]>(project?.images || [])
  const [isPublished, setIsPublished] = useState(project?.isPublished || false)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages(prev => [...prev, ...data.urls])
    } catch (err: any) {
      setError(err.message || 'Image upload me dikkat aayi')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(img => img !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Title zaroori hai')
    if (images.length === 0) return setError('Kam se kam 1 image upload karo')

    setSaving(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      size: size.trim() || null,
      price: price.trim() || null,
      category,
      images,
      isPublished,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/architecture/${project!.id}` : '/api/architecture',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save nahi hua')
      }

      router.push('/admin/architecture')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Kuch galat ho gaya')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-950 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Modern 3BHK Interior — Sector 21"
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-violet-600"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Project ke baare me details..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-violet-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-violet-600"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Location</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Faridabad, Sector 21"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Size</label>
          <input
            value={size}
            onChange={e => setSize(e.target.value)}
            placeholder="e.g. 2400 sq ft"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Price</label>
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. ₹85 Lakhs or On Request"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Images *</label>

        <div className="grid grid-cols-4 gap-3 mb-3">
          {images.map(url => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-800 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-gray-700 transition-all">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-500">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-600">Multiple images select kar sakte ho ek saath.</p>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="w-4 h-4 rounded border-gray-700 bg-gray-900 accent-violet-600"
        />
        <span className="text-sm text-gray-300">Publish immediately</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving || uploading} size="lg">
          {saving ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}