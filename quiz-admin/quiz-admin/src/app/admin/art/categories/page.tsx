import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DeleteCategoryButton from '@/components/art/DeleteCategoryButton'

export default async function CategoriesPage() {
  const categories = await prisma.artCategory.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { artworks: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/art" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Artworks
          </Link>
          <h1 className="text-2xl font-bold mt-2">Art Categories</h1>
        </div>
        <Link href="/admin/art/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
            font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No categories yet</p>
          <Link href="/admin/art/categories/new"
            className="text-blue-500 text-sm mt-2 inline-block">
            Add first category →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id}
              className="flex items-center justify-between border rounded-xl px-5 py-4 bg-white">
              <div>
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cat._count.artworks} artwork{cat._count.artworks !== 1 ? 's' : ''}
                  {cat.description && ` · ${cat.description}`}
                </p>
              </div>
              <DeleteCategoryButton id={cat.id} count={cat._count.artworks} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}