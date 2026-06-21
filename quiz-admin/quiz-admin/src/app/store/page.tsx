import { prisma } from '@/lib/db'
import StoreClient from './StoreClient'

export default async function StorePage() {
  const [artworks, categories] = await Promise.all([
    prisma.artwork.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.artCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  return <StoreClient artworks={artworks} categories={categories} />
}