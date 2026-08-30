import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      id: `${paragraph.slice(0, 12)}-${index}`,
      text: paragraph
        .replace(/[#>*_`~-]/g, '')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .trim(),
    }))
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
  })

  if (!blog || !blog.isPublished) notFound()

  const paragraphs = renderContent(blog.content)

  return (
    <main className="lm-page">
      <article className="section-shell py-16 md:py-20">
        <Link href="/blogs" className="mb-6 inline-flex text-sm font-medium text-[#ca6706] hover:underline">
          ← Back to blogs
        </Link>

        <div className="rounded-[2rem] border border-[#eadbc0] bg-white/75 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-[#5f564f]">
            <span className="lm-mono text-[0.62rem] text-[#ca6706]">{blog.category}</span>
            <span>•</span>
            <span>{blog.topic}</span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
          </div>

          <h1 className="lm-display text-4xl leading-tight text-[#171310] md:text-6xl">{blog.title}</h1>

          {blog.youtubeUrl && (
            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#eadbc0] bg-[#171310] p-2">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full rounded-[1rem]"
                  src={blog.youtubeUrl.replace('watch?v=', 'embed/')}
                  title={blog.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="mt-8 space-y-6 text-lg leading-8 text-[#3b342f]">
            {paragraphs.length > 0 ? (
              paragraphs.map(paragraph => (
                <p key={paragraph.id}>{paragraph.text}</p>
              ))
            ) : (
              <p>{blog.content.replace(/[#*_>-]/g, '').trim()}</p>
            )}
          </div>
        </div>
      </article>
    </main>
  )
}
