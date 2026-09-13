'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import ShareArtworkButton from './ShareArtworkButton'

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
    <article className="group overflow-hidden rounded-[1.5rem] border border-[#eadbc0] bg-white/75 shadow-[0_18px_40px_rgba(23,19,16,0.04)] transition hover:-translate-y-1 hover:border-[#f2801c]">

      {/* Image with navigation */}
      <Link href={`/store/${art.id}`} className="relative block aspect-square bg-[#f9e9d2]">
        {images[imgIndex] ? (
          <img
            src={images[imgIndex]}
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
            <button type="button" onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60
                text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60
                text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button type="button" key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIndex(i) }}
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
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/store/${art.id}`} className="font-semibold leading-tight text-[#171310] hover:text-[#ca6706]">{art.title}</Link>
          <span className="whitespace-nowrap text-sm font-bold text-[#ca6706]">
            ₹{art.price.toLocaleString()}
          </span>
        </div>

        {art.description && (
          <p className="mb-3 line-clamp-2 text-xs text-[#5f564f]">{art.description}</p>
        )}

        {/* Contact Button */}
        {showContact ? (
          <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 break-all">
            {art.contact}
          </div>
        ) : (
          <button
            onClick={() => setShowContact(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#171310] py-2 text-sm font-medium text-[#f7f2eb] transition-colors hover:bg-[#2a241f]"
          >
            <MessageCircle className="w-4 h-4" />
            Contact to Buy
          </button>
        )}
        <div className="mt-3 flex justify-end">
          <ShareArtworkButton title={art.title} url={`/store/${art.id}`} />
        </div>
      </div>
    </article>
  )
}