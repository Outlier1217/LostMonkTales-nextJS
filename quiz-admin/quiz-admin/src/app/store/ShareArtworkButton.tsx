'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { shareLink } from '@/lib/share'

export default function ShareArtworkButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  async function shareArtwork() {
    setError(false)
    try {
      const result = await shareLink(title, `Take a look at ${title}`, url)
      if (result === 'cancelled') return
      setCopied(result === 'copied')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError(true)
    }
  }

  return (
    <button type="button" onClick={shareArtwork} className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] px-4 py-2 text-sm font-medium text-[#171310] transition hover:border-[#f2801c] hover:text-[#ca6706]" aria-label={`Share ${title}`}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {error ? 'Share failed' : copied ? 'Link copied' : 'Share artwork'}
    </button>
  )
}