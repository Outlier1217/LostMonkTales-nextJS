import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ArchitectureDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.architectureProject.findUnique({ where: { id: params.id } })

  if (!project || !project.isPublished) notFound()

  const images = (project.images as string[]) || []

  return (
    <main className="lm-page">
      <article className="section-shell py-16 md:py-20">
        <Link href="/architecture" className="mb-6 inline-flex text-sm font-medium text-[#ca6706] hover:underline">
          ← Back to architecture
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[#eadbc0] bg-white/80 p-3 shadow-[0_20px_60px_rgba(23,19,16,0.04)]">
            {images.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {images.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${project.title} ${index + 1}`} className="h-full min-h-[220px] w-full rounded-[1.2rem] object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-[1.5rem] bg-[#f9e9d2] text-sm uppercase tracking-[0.16em] text-[#5f564f]">
                Project visuals
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/80 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#5f564f]">
              <span className="lm-mono text-[0.62rem] text-[#ca6706]">{project.category}</span>
              {project.location && <span>•</span>}
              {project.location && <span>{project.location}</span>}
            </div>

            <h1 className="lm-display text-4xl leading-tight text-[#171310] md:text-5xl">{project.title}</h1>
            <p className="mt-5 text-base leading-7 text-[#5f564f]">{project.description || 'Designing atmosphere, proportion, and lived experience.'}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.size && (
                <div className="rounded-[1.2rem] border border-[#eddcc4] bg-[#f9e9d2] p-4">
                  <p className="lm-mono text-[0.62rem] text-[#ca6706]">Size</p>
                  <p className="mt-2 text-base text-[#171310]">{project.size}</p>
                </div>
              )}
              {project.price && (
                <div className="rounded-[1.2rem] border border-[#eddcc4] bg-[#f9e9d2] p-4">
                  <p className="lm-mono text-[0.62rem] text-[#ca6706]">Budget</p>
                  <p className="mt-2 text-base text-[#171310]">{project.price}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
