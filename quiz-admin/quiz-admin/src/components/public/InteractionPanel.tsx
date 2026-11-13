'use client'

import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { shareLink } from '@/lib/share'

type TargetType = 'BLOG' | 'QUIZ' | 'COURSE' | 'ARTWORK' | 'PORTRAIT'
type Comment = { id: string; body: string; user: { id: string }; replies?: Comment[] }
type Result = Record<string, number | string>

export function InteractionPanel({ targetType, targetId, title, result, shareOnly = false }: { targetType: TargetType; targetId: string; title: string; result?: Result; shareOnly?: boolean }) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [shareError, setShareError] = useState(false)

  async function load() {
    const response = await fetch(`/api/interactions?targetType=${targetType}&targetId=${targetId}`)
    if (!response.ok) return
    const data = await response.json()
    setLikes(data.likes)
    setLiked(data.liked)
    setComments(data.comments)
  }

  useEffect(() => { load() }, [targetType, targetId])

  async function send(payload: Record<string, unknown>, method = 'POST') {
    setError('')
    const response = await fetch('/api/interactions', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, ...payload }) })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) { setError('Please sign in from the header to interact.'); return false }
    if (!response.ok) { setError(data.error || 'Unable to complete that action.'); return false }
    return true
  }

  async function toggleLike() {
    const ok = await send({ action: 'like' }, liked ? 'DELETE' : 'POST')
    if (ok) { setLiked(!liked); setLikes(likes + (liked ? -1 : 1)) }
  }

  async function submitComment() {
    if (!body.trim()) return
    const ok = await send({ action: 'comment', body, parentId: replyTo })
    if (ok) { setBody(''); setReplyTo(null); await load() }
  }

  async function share() {
    setShareError(false)
    try {
      await shareLink(title, `Take a look at ${title}`)
    } catch {
      setShareError(true)
    }
  }

  if (shareOnly) {
    return <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] px-4 py-2 text-sm text-[#171310]"><Share2 className="h-4 w-4" />{shareError ? 'Share failed' : 'Share'}</button>
  }

  const author = () => 'Member'
  const renderComment = (comment: Comment, nested = false) => (
    <div key={comment.id} className={nested ? 'ml-6 border-l border-[#eadbc0] pl-4' : ''}>
      <p className="text-sm text-[#171310]">{comment.body}</p>
      <div className="mt-1 flex gap-3 text-xs text-[#8a7b6d]"><span>{author()}</span><button type="button" onClick={() => setReplyTo(comment.id)} className="text-[#ca6706] hover:underline">Reply</button></div>
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  )

  return (
    <section className="mt-10 rounded-[1.5rem] border border-[#eadbc0] bg-white/70 p-5 md:p-7">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={toggleLike} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${liked ? 'border-[#f2801c] bg-[#f9e9d2] text-[#ca6706]' : 'border-[#c7b7a5]'}`}><Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />{likes} {likes === 1 ? 'Like' : 'Likes'}</button>
        <button type="button" onClick={() => document.getElementById(`comment-${targetId}`)?.focus()} className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] px-4 py-2 text-sm"><MessageCircle className="h-4 w-4" />Comment</button>
        <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] px-4 py-2 text-sm"><Share2 className="h-4 w-4" />Share</button>
      </div>
      {(error || shareError) && <p className="mt-3 text-sm text-red-700">{shareError ? 'Unable to share this link. Please try again.' : error}</p>}
      <div className="mt-6">
        <h2 className="font-serif text-2xl text-[#171310]">Comments</h2>
        <div className="mt-4 flex gap-2">
          <input id={`comment-${targetId}`} value={body} onChange={event => setBody(event.target.value)} placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'} className="min-w-0 flex-1 rounded-full border border-[#c7b7a5] bg-white px-4 py-2 text-sm outline-none focus:border-[#f2801c]" />
          <button type="button" onClick={submitComment} className="rounded-full bg-[#171310] px-4 py-2 text-sm text-white">Post</button>
        </div>
        {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="mt-2 text-xs text-[#ca6706] hover:underline">Cancel reply</button>}
        <div className="mt-5 space-y-5">{comments.length ? comments.map(comment => renderComment(comment)) : <p className="text-sm text-[#8a7b6d]">Be the first to comment.</p>}</div>
      </div>
    </section>
  )
}
