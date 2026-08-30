import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function PortraitDetailPage({ params }: { params: { id: string } }) {
  const portrait = await prisma.portrait.findUnique({ where: { id: params.id } })

  if (!portrait || !portrait.isPublished) notFound()

  return (
    <main className="lm-page">
      <article className="section-shell py-16 md:py-20">
        <Link href="/art-portraits" className="mb-6 inline-flex text-sm font-medium text-[#ca6706] hover:underline">
          ← Back to portraits
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[#eadbc0] bg-white/80 p-3 shadow-[0_20px_60px_rgba(23,19,16,0.04)]">
            <img src={portrait.image} alt={portrait.title} className="h-full min-h-[420px] w-full rounded-[1.3rem] object-cover" />
          </div>

          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/80 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-8">
            <span className="lm-mono text-[0.62rem] text-[#ca6706]">{portrait.category.replaceAll('_', ' ')}</span>
            <h1 className="lm-display mt-4 text-4xl leading-tight text-[#171310] md:text-5xl">{portrait.title}</h1>
            <p className="mt-5 text-base leading-7 text-[#5f564f]">
              A portrait study captured with a distinct eye for tone, composition, and human character.
            </p>
          </div>
        </div>
      </article>
    </main>
  )
}
