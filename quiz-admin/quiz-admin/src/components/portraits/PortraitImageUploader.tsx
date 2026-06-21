'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

export default function PortraitImageUploader({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

async function uploadFile(file: File) {
  setUploading(true)
  try {
    const formData = new FormData()
    formData.append('files', file)   // 'file' nahi, 'files' — existing route ka contract

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')

    const data = await res.json()
    onChange(data.urls[0])   // 'url' nahi, 'urls' array ka pehla item
  } catch (err) {
    console.error(err)
    alert('Image upload failed. VPS file server check karo.')
  } finally {
    setUploading(false)
  }
}

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  if (value) {
    return (
      <div className="relative w-full max-w-xs">
        <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-800" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-2 right-2 p-1.5 bg-gray-950/80 rounded-full text-gray-300 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full max-w-xs h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
        dragActive ? 'border-violet-500 bg-violet-500/5' : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleSelect} />
      {uploading ? (
        <>
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          <p className="text-xs text-gray-500">Uploading...</p>
        </>
      ) : (
        <>
          <Upload className="w-5 h-5 text-gray-600" />
          <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
        </>
      )}
    </div>
  )
}