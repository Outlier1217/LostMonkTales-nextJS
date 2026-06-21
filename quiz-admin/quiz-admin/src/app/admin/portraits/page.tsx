import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import { PORTRAIT_CATEGORIES } from '@/lib/portrait-categories'
import DeletePortraitButton from '@/components/portraits/DeletePortraitButton'
import PublishToggle from '@/components/portraits/PublishToggle'

export default async function PortraitsAdminPage() {
  const portraits = await prisma.portrait.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Art & Portraits</h1>
          <p className="text-sm text-gray-500 mt-1">{portraits.length} total entries</p>
        </div>
        <Link
          href="/admin/portraits/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Portrait
        </Link>
      </div>

      {PORTRAIT_CATEGORIES.map(({ value, label }) => {
        const items = portraits.filter((p) => p.category === value)
        return (
          <div key={value} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">
              {label} <span className="text-gray-600 font-normal">({items.length})</span>
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-600 border border-dashed border-gray-800 rounded-lg p-4">
                No entries yet
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {items.map((p) => (
                  <div key={p.id} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
                    <img src={p.image} alt={p.title} className="w-full h-32 object-cover" />
                    <div className="p-2.5 space-y-2">
                      <p className="text-xs text-gray-200 font-medium truncate">{p.title}</p>
                      <div className="flex items-center justify-between">
                        <PublishToggle id={p.id} isPublished={p.isPublished} />
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/portraits/${p.id}/edit`} className="text-xs text-gray-500 hover:text-gray-300">
                            Edit
                          </Link>
                          <DeletePortraitButton id={p.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}