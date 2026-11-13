import Link from 'next/link'
import { ArchitectureCategory } from '@prisma/client'
import { prisma } from '@/lib/db'
import LiveSearch from '@/components/public/LiveSearch'

export const dynamic = 'force-dynamic'

export default async function ArchitecturePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || ''
  const category = Object.values(ArchitectureCategory).find(value => value.toLowerCase() === q.toLowerCase())
  const projects = await prisma.architectureProject.findMany({
    where: {
      isPublished: true,
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          ...(category ? [{ category }] : []),
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="lm-page">
      <section className="section-shell py-16 md:py-20">
        <div className="mb-10">
          <p className="lm-mono mb-3 text-[0.68rem] text-[#ca6706]">Design</p>
          <h1 className="lm-display text-4xl text-[#171310] md:text-6xl">Architecture projects</h1>
          <div className="mt-6"><LiveSearch value={q} placeholder="Search architecture by title, category, or location" /></div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/60 p-8 text-[#5f564f]">
            {q ? 'No architecture projects match your search.' : 'No architecture projects yet.'}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(project => {
              const images = (project.images as string[]) || []
              const heroImage = images[0]

              return (
                <Link key={project.id} href={`/architecture/${project.id}`} className="group block overflow-hidden rounded-[1.8rem] border border-[#eadbc0] bg-white/75 shadow-[0_18px_40px_rgba(23,19,16,0.04)] transition hover:-translate-y-1 hover:border-[#f2801c]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#f9e9d2]">
                    {heroImage ? (
                      <img src={heroImage} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-[#5f564f]">Architecture</div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[#5f564f]">
                      <span className="lm-mono text-[0.62rem] text-[#ca6706]">{project.category}</span>
                      {project.location && <span>{project.location}</span>}
                    </div>
                    <h2 className="lm-display text-2xl leading-tight text-[#171310] group-hover:text-[#ca6706]">{project.title}</h2>
                    <p className="mt-3 text-base leading-7 text-[#5f564f]">{project.description ?? 'A space shaped with intent and presence.'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
