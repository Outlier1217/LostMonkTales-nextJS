import Link from 'next/link'

type Blog = {
  id: string
  title: string
  category: string
  topic: string
  content: string
  createdAt: Date
}

export default function BlogsSection({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) return null
  const [featured, ...rest] = blogs

  return (
    <section className="px-6 md:px-16 py-14 lm-divider">
      <p className="lm-mono text-[var(--lm-orange-dark)] mb-6">Featured Reading</p>

      <Link
        href={`/blogs/${featured.id}`}
        className="group block mb-10 pb-10 lm-divider"
      >
        <p className="lm-mono text-[var(--lm-stone)] mb-3">
          {featured.category} · {featured.topic}
        </p>
        <h2 className="lm-display text-3xl md:text-5xl font-medium leading-tight group-hover:text-[var(--lm-orange)] transition-colors">
          {featured.title}
        </h2>
        <p className="mt-4 text-[var(--lm-stone)] max-w-2xl line-clamp-2">
          {featured.content.replace(/[#*_>-]/g, '').slice(0, 180)}...
        </p>
      </Link>

      {rest.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {rest.map(blog => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className="group"
            >
              <p className="lm-mono text-[var(--lm-stone)] mb-2">{blog.category}</p>
              <h3 className="lm-display text-xl font-medium group-hover:text-[var(--lm-orange)] transition-colors">
                {blog.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}