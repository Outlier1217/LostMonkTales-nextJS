'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus, RotateCcw, X } from 'lucide-react'

interface ZoomableImageProps {
  src: string
  alt: string
  className?: string
}

export function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function close() {
    setOpen(false)
    setScale(1)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full cursor-zoom-in overflow-hidden ${className}`}
        aria-label={`Open ${alt} for zoom`}
      >
        <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} image viewer`}
          onClick={close}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setScale(value => Math.max(1, value - 0.25))
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom out"
              disabled={scale === 1}
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setScale(value => Math.min(3, value + 0.25))
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-40"
              aria-label="Zoom in"
              disabled={scale === 3}
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setScale(1)
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                close()
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-full max-w-full overflow-auto" onClick={event => event.stopPropagation()}>
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
            />
          </div>
        </div>
      )}
    </>
  )
}
