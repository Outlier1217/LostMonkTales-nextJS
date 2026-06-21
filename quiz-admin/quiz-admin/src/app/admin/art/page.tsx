export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Plus, Pencil } from 'lucide-react'
import PublishToggle from '@/components/art/PublishToggle'

export default async function ArtworksPage() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Artworks</h1>
          <p className="text-gray-500 text-sm mt-1">{artworks.length} total</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/art/categories"
            className="border border-gray-700 text-gray-300 px-4 py-2 rounded-lg
              text-sm hover:bg-gray-800">
            Manage Categories
          </Link>
          <Link href="/admin/art/new"
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm
              font-medium hover:bg-violet-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Artwork
          </Link>
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No artworks yet</p>
          <Link href="/admin/art/new"
            className="text-violet-400 text-sm mt-2 inline-block">
            Add your first artwork →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(art => {
            const images = art.images as string[]
            return (
              <div key={art.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Cover Image */}
                <div className="aspect-square bg-gray-800 relative">
                  {images[0] ? (
                    <img
                      src={`/api/img?url=${encodeURIComponent(images[0])}`}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                      justify-center text-gray-600 text-sm">
                      No image
                    </div>
                  )}
                  {images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60
                      text-white text-xs px-2 py-0.5 rounded-full">
                      +{images.length - 1} more
                    </span>
                  )}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5
                    rounded-full font-medium
                    ${art.isPublished
                      ? 'bg-green-900/80 text-green-300'
                      : 'bg-yellow-900/80 text-yellow-300'}`}>
                    {art.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-100 truncate">
                        {art.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {art.category.name}
                      </p>
                    </div>
                    <span className="text-violet-400 font-bold text-sm whitespace-nowrap">
                      ₹{art.price.toLocaleString()}
                    </span>
                  </div>
                  {art.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {art.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/admin/art/${art.id}/edit`}
                      className="flex items-center gap-1 text-xs
                        border border-gray-700 text-gray-300 px-3 py-1.5
                        rounded-lg hover:bg-gray-800 flex-1 justify-center"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                    <PublishToggle id={art.id} published={art.isPublished} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}