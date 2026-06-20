import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Pencil, Youtube } from 'lucide-react'
import { DeleteBlogButton } from '@/components/blogs/DeleteBlogButton'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">{blogs.length} total</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button size="lg">
            <Plus className="w-4 h-4" />
            New Blog
          </Button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-gray-500 text-sm">No blogs yet.</p>
          <Link href="/admin/blogs/new" className="text-violet-400 text-sm mt-2 block hover:text-violet-300">
            Write your first blog →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(blog => (
            <div
              key={blog.id}
              className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-200 truncate">{blog.title}</p>
                  {blog.youtubeUrl && (
                    <Youtube className="w-3.5 h-3.5 text-red-400 flex-none" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{blog.category} · {blog.topic}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Badge variant={blog.isPublished ? 'published' : 'draft'}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Link href={`/admin/blogs/${blog.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <DeleteBlogButton id={blog.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}