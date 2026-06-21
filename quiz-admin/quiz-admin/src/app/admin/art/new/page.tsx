import { prisma } from '@/lib/db'
import ArtworkForm from '@/components/art/ArtworkForm'
import Link from 'next/link'

export default async function NewArtworkPage() {
  const categories = await prisma.artCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/art" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Artworks
        </Link>
        <h1 className="text-2xl font-bold mt-2">Add Artwork</h1>
      </div>

      {categories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
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