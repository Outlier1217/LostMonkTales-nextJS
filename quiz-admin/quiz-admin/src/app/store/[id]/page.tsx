import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ShareArtworkButton from '../ShareArtworkButton'
import { BookmarkButton } from '@/components/public/BookmarkButton'

export const dynamic = 'force-dynamic'

export default async function StoreItemPage({ params }: { params: { id: string } }) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!artwork || !artwork.isPublished) notFound()

  const images = (artwork.images as string[]) || []

  return (
    <main className="lm-page">
      <article className="section-shell py-16 md:py-20">
        <Link href="/store" className="mb-6 inline-flex text-sm font-medium text-[#ca6706] hover:underline">
          ← Back to store
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[#eadbc0] bg-white/80 p-3 shadow-[0_20px_60px_rgba(23,19,16,0.04)]">
            {images.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${artwork.title} ${index + 1}`}
                    className="h-full min-h-[220px] w-full rounded-[1.2rem] object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-[#f9e9d2] text-sm uppercase tracking-[0.16em] text-[#5f564f]">
                Artwork preview
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/80 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="lm-mono text-[0.62rem] text-[#ca6706]">{artwork.category.name}</span>
              <span className="text-lg font-semibold text-[#171310]">₹{Number(artwork.price).toLocaleString()}</span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="lm-display text-4xl leading-tight text-[#171310] md:text-5xl">{artwork.title}</h1>
              <BookmarkButton type="ARTWORK" id={artwork.id} />
            </div>

            <p className="mt-5 text-base leading-7 text-[#5f564f]">
              {artwork.description || 'A handcrafted piece created with care and intention.'}
            </p>

            <div className="mt-8 rounded-[1.4rem] border border-[#eddcc4] bg-[#f9e9d2] p-4">
              <p className="lm-mono mb-2 text-[0.62rem] text-[#ca6706]">Contact</p>
              <p className="break-all text-base text-[#171310]">{artwork.contact}</p>
            </div>

            <div className="mt-6">
              <ShareArtworkButton title={artwork.title} />
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
