'use client'
import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const form = new FormData()
    Array.from(files).forEach(f => form.append('files', f))
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.urls) onChange([...value, ...data.urls])
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => onChange(value.filter(u => u !== url))

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="text-gray-500">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click or drag images here</p>
            <p className="text-xs mt-1 opacity-60">JPG, PNG, WEBP — multiple allowed</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}