'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { PORTRAIT_CATEGORIES } from '@/lib/portrait-categories'
import LiveSearch from '@/components/public/LiveSearch'

type Portrait = { id: string; title: string; description: string | null; image: string; category: string }

export default function PortraitsClient({ portraits, query }: { portraits: Portrait[]; query: string }) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL')

  const categoryFiltered = activeCategory === 'ALL' ? portraits : portraits.filter((p) => p.category === activeCategory)
  const filtered = query
    ? categoryFiltered.filter((p) => `${p.title} ${p.description ?? ''} ${p.category.replaceAll('_', ' ')}`.toLowerCase().includes(query.toLowerCase()))
    : categoryFiltered

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-100 mb-1">Art & Portraits</h1>
      <p className="text-sm text-gray-500 mb-6">A collection of hand-crafted portraits</p>
      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-violet-500/30 bg-violet-950/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-100">Want a portrait like this for yourself?</p>
          <p className="mt-1 text-sm text-gray-400">Place an order by calling us at +91 88827 44327.</p>
        </div>
        <a
          href="tel:+918882744327"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          <Phone className="h-4 w-4" />
          Place an order
        </a>
      </section>
      <LiveSearch value={query} placeholder="Search portraits by title or category" />

      <div className="mt-6 flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeCategory === 'ALL' ? 'bg-violet-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
          }`}
        >
          All
        </button>
        {PORTRAIT_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === value ? 'bg-violet-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600">{query ? 'No portraits match your search.' : 'No portraits in this category yet.'}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <Link key={p.id} href={`/art-portraits/${p.id}`} className="group block">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-sm text-gray-300 mt-2 truncate">{p.title}</p>
              {p.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{p.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}