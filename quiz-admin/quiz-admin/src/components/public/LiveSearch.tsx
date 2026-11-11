'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function LiveSearch({ value, placeholder }: { value?: string; placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateSearch(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextValue.trim()) params.set('q', nextValue)
    else params.delete('q')
    const query = params.toString()
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname))
  }

  return (
    <label className="relative block w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7b6d]" />
      <input
        type="search"
        value={value || ''}
        onChange={event => updateSearch(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-full border border-[#d7c3a1] bg-white/60 py-3 pl-11 pr-4 text-sm text-[#171310] outline-none transition focus:border-[#f2801c] ${isPending ? 'opacity-70' : ''}`}
      />
    </label>
  )
}
