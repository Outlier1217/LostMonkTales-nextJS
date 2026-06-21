import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'

export default async function ArtworksPage() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Artworks</h1>
          <p className="text-gray-500 text-sm mt-1">{artworks.length} total</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/art/categories"
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/art/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
              font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Artwork
          </Link>
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No artworks yet</p>
          <Link href="/admin/art/new" className="text-blue-500 text-sm mt-2 inline-block">
            Add your first artwork →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(art => {
            const images = art.images as string[]
            return (
              <div key={art.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Cover Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {images[0] ? (
                    <img
                      src={`/api/img?url=${encodeURIComponent(images[0])}`}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No image
                    </div>
                  )}
                  {/* Image count badge */}
                  {images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white
                      text-xs px-2 py-0.5 rounded-full">
                      +{images.length - 1} more
                    </span>
                  )}
                  {/* Publish status */}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium
                    ${art.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'}`}>
                    {art.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{art.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{art.category.name}</p>
                    </div>
                    <span className="text-blue-600 font-bold text-sm whitespace-nowrap">
                      ₹{art.price.toLocaleString()}
                    </span>
                  </div>
                  {art.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{art.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/admin/art/${art.id}/edit`}
                      className="flex items-center gap-1 text-xs border px-3 py-1.5
                        rounded-lg hover:bg-gray-50 flex-1 justify-center"
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

// Inline client component for publish toggle
import PublishToggle from '@/components/art/PublishToggle'