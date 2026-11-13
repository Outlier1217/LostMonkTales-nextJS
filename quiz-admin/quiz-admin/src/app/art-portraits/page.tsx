import { prisma } from '@/lib/db'
import PortraitsClient from './PortraitsClient'

export const dynamic = 'force-dynamic'

export default async function ArtPortraitsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || ''
  const portraits = await prisma.portrait.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  })

  return <PortraitsClient portraits={portraits} query={q} />
}
