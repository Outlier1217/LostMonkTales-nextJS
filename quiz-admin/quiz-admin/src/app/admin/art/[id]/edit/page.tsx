import { prisma } from '@/lib/db'
import ArtworkForm from '@/components/art/ArtworkForm'
import DeleteArtworkButton from '@/components/art/DeleteArtworkButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArtworkPage({ params }: Props) {
  const { id } = await params

  const [artwork, categories] = await Promise.all([
    prisma.artwork.findUnique({ where: { id } }),
    prisma.artCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!artwork) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/art" className="text-sm text-gray-400 hover:text-gray-200">
            ← Back to Artworks
          </Link>
          <h1 className="text-2xl font-bold text-gray-100 mt-2">Edit Artwork</h1>
        </div>
        <DeleteArtworkButton id={artwork.id} />
      </div>
      <ArtworkForm
        categories={categories}
        initial={{
          id: artwork.id,
          title: artwork.title,
          description: artwork.description ?? '',
          price: artwork.price,
          contact: artwork.contact,
          images: artwork.images as string[],
          categoryId: artwork.categoryId,
          isPublished: artwork.isPublished,
        }}
      />
    </div>
  )
}