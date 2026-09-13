import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function PortraitDetailPage({ params }: { params: { id: string } }) {
  const portrait = await prisma.portrait.findUnique({ where: { id: params.id } })

  if (!portrait || !portrait.isPublished) notFound()

  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#0b0b0b] px-4 py-6 md:px-10">
      <img
        src={portrait.image}
        alt={portrait.title}
        className="max-h-[calc(100vh-8rem)] w-auto max-w-full object-contain"
      />

      <Link
        href="/art-portraits"
        className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white hover:text-black md:left-8 md:top-8"
      >
        ← Back
      </Link>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-6 pt-20 md:px-10 md:pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">{portrait.category.replaceAll('_', ' ')}</p>
        <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{portrait.title}</h1>
      </div>
    </main>
  )
}
