'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { YoutubeEmbed } from '@/components/blogs/YoutubeEmbed'
import { Youtube, Eye, EyeOff } from 'lucide-react'

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
    // youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('?')[0] || null
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes('youtube.com')) {
      // /live/VIDEO_ID or /embed/VIDEO_ID
      const pathMatch = u.pathname.match(/\/(live|embed|shorts)\/([a-zA-Z0-9_-]{11})/)
      if (pathMatch) return pathMatch[2]
      // ?v=VIDEO_ID
      return u.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [topic, setTopic] = useState(initialData?.topic ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const youtubeId = youtubeUrl ? extractYoutubeId(youtubeUrl) : null

  async function handleSubmit(publish: boolean) {
    if (!title.trim() || !category.trim() || !topic.trim() || !content.trim()) {
      setError('Title, Category, Topic and Content are required.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const payload = { title, category, topic, content, youtubeUrl: youtubeUrl || null, isPublished: publish }

      const res = await fetch(
        isEdit ? `/api/blogs/${initialData!.id}` : '/api/blogs',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) throw new Error('Failed to save blog')
      router.push('/admin/blogs')
      router.refresh()
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
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
          className="sm:col-span-1"
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
        {youtubeId && (
          <YoutubeEmbed videoId={youtubeId} />
        )}
      </div>

      {/* Content */}
      {preview ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[300px]">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Preview</p>
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans leading-relaxed">{content || <span className="text-gray-600">Nothing to preview yet…</span>}</pre>
          </div>
        </div>
      ) : (
        <Textarea
          label="Content (Markdown / Plain Text)"
          placeholder="Write your blog content here. Paste from anywhere, write in markdown, or just type freely…"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={18}
          className="font-mono text-sm"
        />
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          loading={loading}
          disabled={loading}
        >
          {isEdit && !initialData?.isPublished ? 'Save Draft' : 'Save as Draft'}
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          loading={loading}
          disabled={loading}
        >
          {isEdit ? 'Update & Publish' : 'Publish'}
        </Button>
        <button
          onClick={() => router.back()}
          className="ml-auto text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}