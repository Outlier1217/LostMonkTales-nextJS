'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'

type BookmarkType = 'QUIZ' | 'BLOG' | 'ARTWORK'

export function BookmarkButton({ type, id }: { type: BookmarkType; id: string }) {
  const [bookmarked, setBookmarked] = useState(false)
  const [busy, setBusy] = useState(true)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    fetch(`/api/bookmarks?type=${type}&id=${id}`)
      .then(async response => {
        if (response.status === 401) { setSignedOut(true); return }
        const data = await response.json()
        setBookmarked(Boolean(data.bookmarked))
      })
      .finally(() => setBusy(false))
  }, [type, id])

  async function toggle() {
    setBusy(true)
    const response = await fetch('/api/bookmarks', {
      method: bookmarked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
    if (response.status === 401) { setSignedOut(true); setBusy(false); return }
    const data = await response.json()
    setBookmarked(Boolean(data.bookmarked))
    setBusy(false)
  }

  return <button type="button" onClick={toggle} disabled={busy || signedOut} title={signedOut ? 'Sign in to bookmark' : bookmarked ? 'Remove bookmark' : 'Bookmark'} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${bookmarked ? 'border-[#f2801c] bg-[#f9e9d2] text-[#ca6706]' : 'border-[#c7b7a5] text-[#171310] hover:border-[#f2801c]'} disabled:cursor-not-allowed disabled:opacity-50`}><Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />{signedOut ? 'Sign in to save' : bookmarked ? 'Saved' : 'Save'}</button>
}
