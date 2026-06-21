'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import { PORTRAIT_CATEGORIES } from '@/lib/portrait-categories'

type PortraitCategoryValue = typeof PORTRAIT_CATEGORIES[number]['value']

interface BulkItem {
  id: string
  image: string
  title: string
}

export default function BulkPortraitUploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<PortraitCategoryValue>(PORTRAIT_CATEGORIES[0].value)
  const [publishImmediately, setPublishImmediately] = useState(false)
  const [items, setItems] = useState<BulkItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return

    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      const urls: string[] = data.urls

      const newItems: BulkItem[] = files.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        image: urls[i],
        title: file.name.replace(/\.[^/.]+$/, ''),
      }))

      setItems((prev) => [...prev, ...newItems])
    } catch (err) {
      console.error(err)
      alert('Bulk upload failed. VPS file server check karo.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files)
    e.target.value = ''
  }

  function updateTitle(id: string, title: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, title } : it)))
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  async function handleSaveAll() {
    if (!items.length) {
      alert('Pehle kuch images upload karo')
      return
    }
    if (items.some((it) => !it.title.trim())) {
      alert('Sabhi images ka title bharo')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/portraits/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            title: it.title,
            image: it.image,
            category,
            isPublished: publishImmediately,
          })),
        }),
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
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Category (is poore batch ke liye)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PortraitCategoryValue)}
          className="w-full max-w-xs bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-600"
        >
          {PORTRAIT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
          dragActive ? 'border-violet-500 bg-violet-500/5' : 'border-gray-800 hover:border-gray-700'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
            <p className="text-xs text-gray-500">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-gray-600" />
            <p className="text-xs text-gray-500">Multiple images select/drag karo (ek saath)</p>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-3">{items.length} images ready — har ek ka title check/edit kar lo</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900 relative">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1.5 right-1.5 p-1 bg-gray-950/80 rounded-full text-gray-300 hover:text-red-400 transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <img src={item.image} alt={item.title} className="w-full h-28 object-cover" />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateTitle(item.id, e.target.value)}
                  placeholder="Title"
                  className="w-full bg-gray-900 text-xs text-gray-100 px-2 py-1.5 focus:outline-none border-t border-gray-800"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={publishImmediately}
          onChange={(e) => setPublishImmediately(e.target.checked)}
          className="accent-violet-600"
        />
        Sabko publish immediately karo
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving || uploading || items.length === 0}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : `Save All (${items.length})`}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/portraits')}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}