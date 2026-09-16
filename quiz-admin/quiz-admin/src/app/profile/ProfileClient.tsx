'use client'

import { useState } from 'react'

type User = { id: string; email: string | null; phone: string | null; image: string | null }

export function ProfileClient({ user }: { user: User }) {
  const [phone, setPhone] = useState(user.phone ?? '')
  const [image, setImage] = useState(user.image ?? '')
  const [preview, setPreview] = useState(user.image ?? '')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setMessage('Choose an image up to 5 MB.')
      return
    }
    const formData = new FormData()
    formData.append('files', new File([file], `profile-${Date.now()}.${file.name.split('.').pop() || 'jpg'}`, { type: file.type }))
    const response = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await response.json()
    if (!response.ok || !data.urls?.[0]) {
      setMessage(data.error || 'Image upload failed.')
      return
    }
    setImage(data.urls[0])
    setPreview(data.urls[0])
    setMessage('Image ready to save.')
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, image }),
    })
    const data = await response.json()
    setMessage(response.ok ? 'Profile updated.' : data.error || 'Unable to update profile.')
    setSaving(false)
  }

  return (
    <form onSubmit={saveProfile} className="rounded-[2rem] border border-[#eadbc0] bg-white/75 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {preview ? <img src={preview} alt="Profile" className="h-28 w-28 rounded-full object-cover ring-4 ring-[#f9e9d2]" /> : <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#171310] text-4xl text-[#f7f2eb]">{(user.email || user.phone || 'U')[0].toUpperCase()}</div>}
        <div>
          <label className="inline-flex cursor-pointer rounded-full border border-[#c7b7a5] px-4 py-2 text-sm font-medium text-[#171310] hover:border-[#f2801c]">
            Change image
            <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          </label>
          <p className="mt-2 text-xs text-[#5f564f]">JPG, PNG, or another image up to 5 MB.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div><label className="text-sm font-medium text-[#171310]">Email</label><p className="mt-2 rounded-xl border border-[#eadbc0] bg-[#f7f2eb] px-3 py-2.5 text-[#5f564f]">{user.email || 'Not added'}</p></div>
        <div><label htmlFor="profile-phone" className="text-sm font-medium text-[#171310]">Phone number</label><input id="profile-phone" value={phone} onChange={event => setPhone(event.target.value)} type="tel" className="mt-2 w-full rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-[#171310] outline-none focus:border-[#f2801c]" /></div>
      </div>
      <div className="mt-6 flex items-center gap-4"><button type="submit" disabled={saving} className="rounded-full bg-[#171310] px-5 py-3 text-sm font-medium text-[#f7f2eb] disabled:opacity-50">{saving ? 'Saving...' : 'Save profile'}</button>{message && <p className="text-sm text-[#5f564f]">{message}</p>}</div>
    </form>
  )
}
