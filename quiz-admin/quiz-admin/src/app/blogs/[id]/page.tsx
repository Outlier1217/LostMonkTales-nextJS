import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { isHtmlContent, sanitizeBlogHtml } from '@/lib/blog-content'
import { YoutubeEmbed } from '@/components/blogs/YoutubeEmbed'

export const dynamic = 'force-dynamic'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function extractYoutubeId(url: string): string | null {
  try {
    const value = new URL(url)
    if (value.hostname === 'youtu.be') return value.pathname.slice(1).split('/')[0] || null
    if (!value.hostname.includes('youtube.com')) return null
    const pathMatch = value.pathname.match(/\/(?:live|embed|shorts)\/([a-zA-Z0-9_-]{11})/)
    return pathMatch?.[1] ?? value.searchParams.get('v')
  } catch {
    return null
  }
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

  const richContent = isHtmlContent(blog.content) ? sanitizeBlogHtml(blog.content) : null

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

          {blog.thumbnailUrl && (
            <img src={blog.thumbnailUrl} alt={blog.title} className="mt-8 max-h-[32rem] w-full rounded-[1.5rem] object-cover" />
          )}

          {blog.youtubeUrl && extractYoutubeId(blog.youtubeUrl) && (
            <div className="mt-8">
              <YoutubeEmbed videoId={extractYoutubeId(blog.youtubeUrl)!} />
            </div>
          )}

          <div className="mt-8 text-lg leading-8 text-[#3b342f] [&_a]:text-[#ca6706] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#f2801c] [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-6 [&_ol]:list-decimal [&_p]:mb-6 [&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-[#eadbc0] [&_td]:p-2 [&_th]:border [&_th]:border-[#eadbc0] [&_th]:bg-[#f7f2eb] [&_th]:p-2 [&_ul]:list-disc" >
            {richContent ? (
              <div dangerouslySetInnerHTML={{ __html: richContent }} />
            ) : (
              renderContent(blog.content).map(paragraph => (
                <p key={paragraph.id}>{paragraph.text}</p>
              ))
            )}
          </div>
        </div>
      </article>
    </main>
  )
}
