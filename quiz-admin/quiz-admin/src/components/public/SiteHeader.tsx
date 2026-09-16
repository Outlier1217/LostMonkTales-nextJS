'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, UserCircle2 } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/store', label: 'Store' },
  { href: '/art-portraits', label: 'Portraits' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/contact', label: 'Contact' },
]

type UserState = {
  id: string
  email?: string | null
  phone?: string | null
  image?: string | null
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [user, setUser] = useState<UserState | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    image: '',
    identifier: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoadingUser(false)
    }
  }

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const route = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin'
      let imageUrl = ''

      if (authMode === 'signup' && imageFile) {
        const uploadData = new FormData()
        uploadData.append('files', new File([imageFile], `profile-${Date.now()}.${imageFile.name.split('.').pop() || 'jpg'}`, { type: imageFile.type }))
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: uploadData })
        const uploadResult = await uploadResponse.json()
        if (!uploadResponse.ok || !uploadResult.urls?.[0]) {
          throw new Error('Profile image upload failed. Please try again.')
        }
        imageUrl = uploadResult.urls[0]
      }

      const payload = authMode === 'signup'
        ? {
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            image: imageUrl,
          }
        : {
            identifier: formData.identifier,
            password: formData.password,
          }

      const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      setAuthOpen(false)
      setMenuOpen(false)
      setFormData({ email: '', phone: '', password: '', image: '', identifier: '' })
      setImageFile(null)
      setImagePreview('')
      await fetchUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be 5 MB or smaller.')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    setAuthOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5dbc5] bg-[#f7f2eb]/90 backdrop-blur-md">
      <div className="section-shell flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center" aria-label="Lost Monk Tales home">
          <Image src="/logo.png" alt="Lost Monk Tales logo" width={220} height={58} priority className="h-10 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-[#1f1b19] transition hover:text-[#ca6706]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loadingUser && user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" aria-label="Open profile">
                {user.image ? (
                  <img src={user.image} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#f2801c]" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171310] text-sm font-semibold text-[#f7f2eb]">
                    {(user.email || user.phone || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <button onClick={handleSignOut} className="rounded-full border border-[#d7c3a1] px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#171310] transition hover:border-[#f2801c] hover:text-[#ca6706]">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => { setAuthMode('signin'); setAuthOpen(true) }} className="rounded-full border border-[#d7c3a1] bg-transparent px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#171310] transition hover:border-[#f2801c] hover:text-[#ca6706]">
                Sign in
              </button>
              <button onClick={() => { setAuthMode('signup'); setAuthOpen(true) }} className="rounded-full bg-[#171310] px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#f7f2eb] transition hover:bg-[#2a241f]">
                Sign up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center justify-center rounded-full border border-[#d7c3a1] p-2 text-[#171310] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#e5dbc5] bg-[#f7f2eb] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-base font-medium text-[#1f1b19]">
                {item.label}
              </Link>
            ))}

            {!loadingUser && user ? (
              <div className="mt-4 border-t border-[#eadcc3] pt-4">
                <div className="flex items-center gap-3">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} aria-label="Open profile">
                    {user.image ? (
                      <img src={user.image} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#f2801c]" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171310] text-sm font-semibold text-[#f7f2eb]">
                        {(user.email || user.phone || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-[#171310]">
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex gap-3 border-t border-[#eadcc3] pt-4">
                <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); setMenuOpen(false) }} className="flex-1 rounded-full border border-[#d7c3a1] px-4 py-2 text-sm font-medium text-[#171310]">
                  Sign in
                </button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); setMenuOpen(false) }} className="flex-1 rounded-full bg-[#171310] px-4 py-2 text-sm font-medium text-[#f7f2eb]">
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {authOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#171310]/35 p-4 backdrop-blur-[1px]">
          <div className="my-4 w-full max-w-[440px] rounded-[1.5rem] border border-[#e3d5ba] bg-[#f4efe8] p-5 shadow-[0_24px_70px_rgba(23,19,16,0.18)] sm:my-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="lm-mono text-[0.62rem] text-[#ca6706]">{authMode === 'signin' ? 'Welcome back' : 'Create account'}</p>
                <h3 className="lm-display text-3xl text-[#171310]">
                  {authMode === 'signin' ? 'Sign in' : 'Sign up'}
                </h3>
              </div>
              <button onClick={() => setAuthOpen(false)} className="rounded-full border border-[#d7c3a1] p-2 text-[#171310]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#171310]">Email</label>
                    <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="you@example.com" className="w-full rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-[#171310] outline-none ring-0 placeholder:text-[#8b7d73] focus:border-[#f2801c]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#171310]">Phone</label>
                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} type="tel" placeholder="+91 98765 43210" className="w-full rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-[#171310] outline-none ring-0 placeholder:text-[#8b7d73] focus:border-[#f2801c]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#171310]">Profile image (optional)</label>
                    <div className="flex items-center gap-3">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile preview" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#f2801c]" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171310] text-xs text-[#f7f2eb]">Photo</div>
                      )}
                      <label className="flex-1 cursor-pointer rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-sm text-[#8b7d73] transition hover:border-[#f2801c]">
                        {imageFile ? imageFile.name : 'Choose an image from your device'}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#171310]">Email or phone</label>
                  <input value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} type="text" placeholder="your email or phone" className="w-full rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-[#171310] outline-none ring-0 placeholder:text-[#8b7d73] focus:border-[#f2801c]" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#171310]">Password</label>
                <input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} type="password" placeholder="Enter password" className="w-full rounded-xl border border-[#d7c3a1] bg-white px-3 py-2.5 text-[#171310] outline-none ring-0 placeholder:text-[#8b7d73] focus:border-[#f2801c]" />
              </div>

              {error && (
                <div className="rounded-xl border border-[#f0c4c4] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a2b2b]">
                  {error}
                </div>
              )}

              <button disabled={submitting} type="submit" className="w-full rounded-full bg-[#171310] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#f7f2eb] transition hover:bg-[#2a241f] disabled:opacity-60">
                {submitting ? 'Please wait...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-[#5f564f]">
              {authMode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="font-medium text-[#ca6706] hover:underline">
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}
