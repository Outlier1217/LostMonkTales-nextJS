'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

interface Props {
  art: {
    id: string; title: string; description: string | null
    price: number; contact: string; images: unknown
    category: { name: string }
  }
}

export default function ArtCard({ art }: Props) {
  const images = art.images as string[]
  const [imgIndex, setImgIndex] = useState(0)
  const [showContact, setShowContact] = useState(false)

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex(i => (i + 1) % images.length)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden
      hover:border-gray-600 transition-all group">

      {/* Image with navigation */}
      <div className="aspect-square relative bg-gray-800">
        {images[imgIndex] ? (
          <img
            src={`/api/img?url=${encodeURIComponent(images[imgIndex])}`}
            alt={art.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
            No image
          </div>
        )}

        {/* Prev / Next arrows — show only if multiple images */}
        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60
                text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60
                text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setImgIndex(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors
                    ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs
          px-2 py-0.5 rounded-full">
          {art.category.name}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-100 leading-tight">{art.title}</h3>
          <span className="text-violet-400 font-bold text-sm whitespace-nowrap">
            ₹{art.price.toLocaleString()}
          </span>
        </div>

        {art.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{art.description}</p>
        )}

        {/* Contact Button */}
        {showContact ? (
          <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 break-all">
            {art.contact}
          </div>
        ) : (
          <button
            onClick={() => setShowContact(true)}
            className="w-full flex items-center justify-center gap-2 bg-violet-600
              hover:bg-violet-700 text-white text-sm py-2 rounded-lg transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contact to Buy
          </button>
        )}
      </div>
    </div>
  )
}