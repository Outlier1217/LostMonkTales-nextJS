'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2 } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  INTERIOR: 'Interior',
  COMMERCIAL: 'Commercial',
  RESIDENTIAL: 'Residential',
}

export function ArchitectureList({ projects }: { projects: any[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function togglePublish(id: string, current: boolean) {
    setBusyId(id)
    await fetch(`/api/architecture/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    setBusyId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Ye project delete karna hai? Ye action undo nahi ho sakta.')) return
    setBusyId(id)
    await fetch(`/api/architecture/${id}`, { method: 'DELETE' })
    setBusyId(null)
    router.refresh()
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
        <p className="text-gray-500 text-sm">Abhi koi project nahi hai.</p>
        <Link href="/admin/architecture/new" className="text-violet-400 text-sm mt-2 block hover:text-violet-300">
          Pehla project add karo →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {projects.map(project => {
        const images = Array.isArray(project.images) ? project.images : []
        return (
          <div
            key={project.id}
            className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all"
          >
            <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden shrink-0">
              {images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={project.title} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{project.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {project.location || 'Location not set'} {project.size ? `· ${project.size}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-300">
                {CATEGORY_LABELS[project.category] || project.category}
              </span>
              <Badge variant={project.isPublished ? 'published' : 'draft'}>
                {project.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <span className="text-xs text-gray-500">{images.length} img</span>

              <button
                onClick={() => togglePublish(project.id, project.isPublished)}
                disabled={busyId === project.id}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {project.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <Link
                href={`/admin/architecture/${project.id}`}
                className="p-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => handleDelete(project.id)}
                disabled={busyId === project.id}
                className="p-1.5 rounded-lg border border-gray-700 text-red-400 hover:bg-red-950 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}