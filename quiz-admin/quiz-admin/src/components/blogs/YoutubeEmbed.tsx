'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

interface YoutubeEmbedProps {
  videoId: string
}

export function YoutubeEmbed({ videoId }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (playing) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-800 bg-black">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-800 bg-black cursor-pointer group"
      style={{ paddingBottom: '56.25%' }}
      onClick={() => setPlaying(true)}
    >
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => {
          // fallback to hqdefault if maxres not available
          ;(e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <Play className="w-7 h-7 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  )
}