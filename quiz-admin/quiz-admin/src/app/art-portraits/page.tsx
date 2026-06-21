import { prisma } from '@/lib/db'
import PortraitsClient from './PortraitsClient'

export const dynamic = 'force-dynamic'

export default async function ArtPortraitsPage() {
    const portraits = await prisma.portrait.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    })


  return <PortraitsClient portraits={portraits} />
}
