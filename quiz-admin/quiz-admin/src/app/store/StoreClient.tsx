'use client'
import { useState } from 'react'
import Link from 'next/link'
import ArtCard from './ArtCard'

interface Category { id: string; name: string }
interface Artwork {
  id: string; title: string; description: string | null
  price: number; contact: string; images: unknown
  category: Category; isPublished: boolean
}

export default function StoreClient({
  artworks, categories
}: {
  artworks: Artwork[]
  categories: Category[]
}) {
  const [active, setActive] = useState<string>('all')

  const filtered = active === 'all'
    ? artworks
    : artworks.filter(a => a.category.id === active)

  return (
    <main className="lm-page">
      {/* Header */}
      <div className="section-shell py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="lm-mono mb-3 text-[0.68rem] text-[#ca6706]">The collection</p>
            <h1 className="lm-display text-4xl text-[#171310] md:text-6xl">Art Store</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5f564f]">Original artworks selected with care. Open a piece to explore every image and share it with someone.</p>
          </div>
          <Link href="/art-portraits" className="text-sm font-medium text-[#171310] underline-offset-4 hover:text-[#ca6706] hover:underline">Browse portraits →</Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
              ${active === 'all'
                ? 'bg-[#171310] text-[#f7f2eb]'
                : 'border border-[#c7b7a5] text-[#5f564f] hover:border-[#f2801c]'}`}
          >
            All ({artworks.length})
          </button>
          {categories.map(cat => {
            const count = artworks.filter(a => a.category.id === cat.id).length
            if (count === 0) return null
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                  ${active === cat.id
                    ? 'bg-[#171310] text-[#f7f2eb]'
                    : 'border border-[#c7b7a5] text-[#5f564f] hover:border-[#f2801c]'}`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/60 py-20 text-center text-[#5f564f]">
            <p>No artworks in this category yet</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(art => (
              <ArtCard key={art.id} art={art} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}