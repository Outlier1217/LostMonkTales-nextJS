'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Blog = {
  id: string
  title: string
  category: string
  topic: string
  content: string
  createdAt: Date
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogsSection({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) return null

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (blogs.length < 2) return

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % blogs.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [blogs.length])

  const featured = blogs[activeIndex]
  const remaining = blogs.filter((_, index) => index !== activeIndex)

  return (
    <section className="section-shell py-16 md:py-20 lm-divider">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="lm-mono text-[var(--lm-orange-deep)] mb-3">Featured reading</p>
          <h2 className="lm-display text-3xl md:text-5xl text-[#171310]">Journal</h2>
        </div>

        <Link href="/blogs" className="hidden text-sm font-medium text-[#171310] underline-offset-4 hover:underline md:inline-flex">
          View all posts
        </Link>
      </div>

      <div className="rounded-[2rem] border border-[#eadcc3] bg-white/70 p-4 shadow-[0_24px_60px_rgba(23,19,16,0.05)] md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {blogs.map((blog, index) => (
              <button
                key={blog.id}
                type="button"
                aria-label={`Show blog ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-[#f2801c]' : 'w-2.5 bg-[#d8c7b0]'
                }`}
              />
            ))}
          </div>

          <Link href="/blogs" className="text-xs font-medium uppercase tracking-[0.12em] text-[#171310] hover:text-[#ca6706]">
            All posts
          </Link>
        </div>

        <Link href={`/blogs/${featured.id}`} className="group block">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#61564d]">
            <span className="lm-mono text-[0.62rem] text-[#ca6706]">{featured.category}</span>
            <span>•</span>
            <span>{featured.topic}</span>
            <span>•</span>
            <span>{formatDate(featured.createdAt)}</span>
          </div>

          <h3 className="lm-display max-w-4xl text-3xl leading-tight text-[#171310] md:text-5xl">
            {featured.title}
          </h3>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f564f] md:text-lg">
            {featured.content.replace(/[#*_>-]/g, '').slice(0, 220)}...
          </p>
        </Link>
      </div>

      {remaining.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {remaining.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} className="group block rounded-[1.5rem] border border-[#eadcc3] bg-white/70 p-5 transition hover:-translate-y-1 hover:border-[#f2801c]">
              <p className="lm-mono mb-3 text-[0.62rem] text-[#ca6706]">{blog.category}</p>
              <h3 className="lm-display text-2xl leading-tight text-[#171310] group-hover:text-[#ca6706]">
                {blog.title}
              </h3>
              <p className="mt-2 text-sm text-[#5f564f]">{formatDate(blog.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}