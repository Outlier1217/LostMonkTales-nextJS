import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BlogForm } from '@/components/blogs/BlogForm'

export const dynamic = 'force-dynamic'

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({ where: { id: params.id } })
  if (!blog) notFound()

  return (
    <BlogForm
      initialData={{
        id: blog.id,
        title: blog.title,
        category: blog.category,
        topic: blog.topic,
        content: blog.content,
        youtubeUrl: blog.youtubeUrl,
        isPublished: blog.isPublished,
      }}
    />
  )
}