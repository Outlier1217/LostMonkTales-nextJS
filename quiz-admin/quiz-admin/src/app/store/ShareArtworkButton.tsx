'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareArtworkButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false)

  async function shareArtwork() {
    const shareUrl = url || window.location.href
    if (navigator.share) {
      await navigator.share({ title, text: `Take a look at ${title}`, url: shareUrl })
      return
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
    } else {
      const input = document.createElement('textarea')
      input.value = shareUrl
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button type="button" onClick={shareArtwork} className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] px-4 py-2 text-sm font-medium text-[#171310] transition hover:border-[#f2801c] hover:text-[#ca6706]">
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Link copied' : 'Share artwork'}
    </button>
  )
}