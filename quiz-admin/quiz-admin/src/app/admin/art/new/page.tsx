import { prisma } from '@/lib/db'
import ArtworkForm from '@/components/art/ArtworkForm'
import Link from 'next/link'

export default async function NewArtworkPage() {
  const categories = await prisma.artCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/art" className="text-sm text-gray-400 hover:text-gray-200">
          ← Back to Artworks
        </Link>
        <h1 className="text-2xl font-bold text-gray-100 mt-2">Add Artwork</h1>
      </div>

      {categories.length === 0 ? (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4
          text-sm text-yellow-300">
          Pehle ek category banao.{' '}
          <Link href="/admin/art/categories/new" className="underline font-medium">
            Category add karo →
          </Link>
        </div>
      ) : (
        <ArtworkForm categories={categories} />
      )}
    </div>
  )
}