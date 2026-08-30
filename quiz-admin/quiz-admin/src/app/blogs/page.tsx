import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="lm-page">
      <section className="section-shell py-16 md:py-20">
        <div className="mb-10">
          <p className="lm-mono mb-3 text-[0.68rem] text-[#ca6706]">Journal</p>
          <h1 className="lm-display text-4xl text-[#171310] md:text-6xl">Stories from the archive</h1>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-[2rem] border border-[#eadbc0] bg-white/60 p-8 text-[#5f564f]">
            No published blogs yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map(blog => (
              <Link key={blog.id} href={`/blogs/${blog.id}`} className="group block rounded-[1.8rem] border border-[#eadbc0] bg-white/75 p-5 shadow-[0_18px_40px_rgba(23,19,16,0.04)] transition hover:-translate-y-1 hover:border-[#f2801c]">
                <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[#5f564f]">
                  <span className="lm-mono text-[0.62rem] text-[#ca6706]">{blog.category}</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>

                <h2 className="lm-display text-2xl leading-tight text-[#171310] group-hover:text-[#ca6706]">{blog.title}</h2>
                <p className="mt-3 text-sm uppercase tracking-[0.12em] text-[#5f564f]">{blog.topic}</p>
                <p className="mt-4 text-base leading-7 text-[#5f564f]">
                  {blog.content.replace(/[#*_>-]/g, '').slice(0, 170)}...
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
