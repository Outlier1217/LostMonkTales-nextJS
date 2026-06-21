'use client'
import { useState } from 'react'
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-5">
        <h1 className="text-2xl font-bold">Art Store</h1>
        <p className="text-gray-400 text-sm mt-1">
          Original artworks — handpicked collection
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActive('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${active === 'all'
                ? 'bg-violet-600 text-white'
                : 'border border-gray-700 text-gray-400 hover:border-gray-500'}`}
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${active === cat.id
                    ? 'bg-violet-600 text-white'
                    : 'border border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p>No artworks in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(art => (
              <ArtCard key={art.id} art={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}