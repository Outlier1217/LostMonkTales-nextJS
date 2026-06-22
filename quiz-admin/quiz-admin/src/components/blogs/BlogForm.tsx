'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { YoutubeEmbed } from '@/components/blogs/YoutubeEmbed'
import { Youtube, Eye, EyeOff, ImageIcon } from 'lucide-react'

interface BlogFormProps {
  initialData?: {
    id: string
    title: string
    category: string
    topic: string
    content: string
    youtubeUrl: string | null
    isPublished: boolean
  }
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('?')[0] || null
    }
    if (u.hostname.includes('youtube.com')) {
      const pathMatch = u.pathname.match(/\/(live|embed|shorts)\/([a-zA-Z0-9_-]{11})/)
      if (pathMatch) return pathMatch[2]
      return u.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

// Render markdown images in preview
function renderContent(text: string) {
  const parts = text.split(/(!\[.*?\]\(.*?\))/g)
  return parts.map((part, i) => {
    const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
    if (imgMatch) {
      return (
        <img
          key={i}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          className="max-w-full rounded-lg my-3 border border-gray-700"
        />
      )
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part}
      </span>
    )
  })
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const isEdit = !!initialData
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [topic, setTopic] = useState(initialData?.topic ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const youtubeId = youtubeUrl ? extractYoutubeId(youtubeUrl) : null

  // Insert text at cursor position
  function insertAtCursor(text: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent(prev => prev + text)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setContent(prev => prev.slice(0, start) + text + prev.slice(end))
    setTimeout(() => {
      textarea.selectionStart = start + text.length
      textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }

  // Upload image file to VPS
  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.type.split('/')[1] || 'png'
    const renamed = new File([file], `blog-${Date.now()}.${ext}`, { type: file.type })
    const formData = new FormData()
    formData.append('files', renamed)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) return null
    const data = await res.json()
    return data.urls?.[0] ?? null
  }

  // Handle paste — intercept images
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    if (imageItems.length === 0) return // normal text paste, don't block

    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      for (const item of imageItems) {
        const file = item.getAsFile()
        if (!file) continue
        const url = await uploadImage(file)
        if (!url) {
          setError('Image upload failed. Check VPS connection.')
          continue
        }
        insertAtCursor(`![image](${url})\n`)
      }
    } catch {
      setError('Image paste failed. Try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  // Handle file input (click to upload image)
  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const url = await uploadImage(file)
        if (!url) {
          setError('Image upload failed.')
          continue
        }
        insertAtCursor(`![image](${url})\n`)
      }
    } catch {
      setError('Image upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(publish: boolean) {
    if (!title.trim() || !category.trim() || !topic.trim() || !content.trim()) {
      setError('Title, Category, Topic and Content are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload = {
        title, category, topic, content,
        youtubeUrl: youtubeUrl || null,
        isPublished: publish,
      }
      const res = await fetch(
        isEdit ? `/api/blogs/${initialData!.id}` : '/api/blogs',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error()
      router.push('/admin/blogs')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{isEdit ? 'Edit Blog' : 'New Blog'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Update your post' : 'Write a new post'}</p>
        </div>
        <button
          onClick={() => setPreview(p => !p)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Category"
          placeholder="e.g. Web3, AI, Tutorial"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <Input
          label="Topic"
          placeholder="e.g. Solidity, React, DeFi"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
        <Input
          label="Title"
          placeholder="Blog title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* YouTube URL */}
      <div className="space-y-3">
        <div className="relative">
          <Youtube className="absolute left-3 top-[34px] w-4 h-4 text-red-400 pointer-events-none" />
          <Input
            label="YouTube Video URL (optional)"
            placeholder="https://youtube.com/watch?v=... or youtu.be/..."
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            className="pl-9"
          />
        </div>
        {youtubeId && <YoutubeEmbed videoId={youtubeId} />}
      </div>

      {/* Content */}
      {preview ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[300px]">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Preview</p>
          <div className="text-gray-300 text-sm leading-relaxed">
            {content
              ? renderContent(content)
              : <span className="text-gray-600">Nothing to preview yet…</span>
            }
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Content (Markdown / Plain Text)
            </label>
            <div className="flex items-center gap-2">
              {uploading && (
                <span className="text-xs text-violet-400 animate-pulse flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading…
                </span>
              )}
              {/* Click to upload image button */}
              <label className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 cursor-pointer transition-colors px-2 py-1 rounded-md hover:bg-gray-800">
                <ImageIcon className="w-3.5 h-3.5" />
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder="Write your blog content here. Paste text or images directly…"
            value={content}
            onChange={e => setContent(e.target.value)}
            onPaste={handlePaste}
            rows={18}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-y font-mono"
          />
          <p className="text-xs text-gray-600">
            Tip: Paste images directly (Ctrl+V) or click "Add Image" — they auto-upload to VPS and insert as markdown.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="secondary" onClick={() => handleSubmit(false)} loading={loading} disabled={loading || uploading}>
          {isEdit && !initialData?.isPublished ? 'Save Draft' : 'Save as Draft'}
        </Button>
        <Button onClick={() => handleSubmit(true)} loading={loading} disabled={loading || uploading}>
          {isEdit ? 'Update & Publish' : 'Publish'}
        </Button>
        <button onClick={() => router.back()} className="ml-auto text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>

    </div>
  )
}
