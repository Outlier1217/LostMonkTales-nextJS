'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Highlight = {
  title: string
  href: string
  image?: string | null
  label: string
}

export default function HomeHighlightsPopup({ blog, course }: { blog?: Highlight; course?: Highlight }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 5000)
    return () => window.clearTimeout(timer)
  }, [])

  if (!open || (!blog && !course)) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#171310]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="home-highlights-title">
      <div className="relative w-full max-w-2xl rounded-[2rem] border border-[#eadbc0] bg-[#f7f2eb] p-6 shadow-2xl md:p-8">
        <button type="button" onClick={() => setOpen(false)} aria-label="Close highlights" className="absolute right-4 top-4 rounded-full p-2 text-[#5f564f] transition hover:bg-[#eadcc3] hover:text-[#171310]">
          <X className="h-5 w-5" />
        </button>
        <p className="lm-mono text-[0.65rem] text-[#ca6706]">New from Lost Monk Tales</p>
        <h2 id="home-highlights-title" className="lm-display mt-2 pr-8 text-3xl text-[#171310] md:text-4xl">Stay curious.</h2>
        <p className="mt-2 text-sm text-[#5f564f]">Explore the latest story and course from our world.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[blog, course].filter((item): item is Highlight => Boolean(item)).map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="group overflow-hidden rounded-[1.25rem] border border-[#eadbc0] bg-white/75 transition hover:-translate-y-1 hover:border-[#f2801c]">
              {item.image ? <img src={item.image} alt="" className="h-32 w-full object-cover" /> : <div className="h-32 bg-[#eadcc3]" />}
              <div className="p-4">
                <p className="lm-mono text-[0.58rem] text-[#ca6706]">{item.label}</p>
                <h3 className="mt-2 font-serif text-xl leading-tight text-[#171310] group-hover:text-[#ca6706]">{item.title}</h3>
                <span className="mt-3 inline-block text-sm font-medium text-[#ca6706]">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(false)} className="mt-6 text-sm text-[#5f564f] underline underline-offset-4 hover:text-[#ca6706]">
          Continue to website
        </button>
      </div>
    </div>
  )
}
