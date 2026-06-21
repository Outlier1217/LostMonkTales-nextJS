'use client'

import { useState } from 'react'
import { PORTRAIT_CATEGORIES } from '@/lib/portrait-categories'

type Portrait = { id: string; title: string; image: string; category: string }

export default function PortraitsClient({ portraits }: { portraits: Portrait[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL')

  const filtered = activeCategory === 'ALL' ? portraits : portraits.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-100 mb-1">Art & Portraits</h1>
      <p className="text-sm text-gray-500 mb-6">A collection of hand-crafted portraits</p>

      <div className="flex flex-wrap gap-2 mb-8">
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
        <p className="text-sm text-gray-600">No portraits in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-sm text-gray-300 mt-2 truncate">{p.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}