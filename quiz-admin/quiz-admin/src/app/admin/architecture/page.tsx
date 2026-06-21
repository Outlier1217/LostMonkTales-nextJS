import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { ArchitectureList } from '@/components/architecture/ArchitectureList'

export const dynamic = 'force-dynamic'

export default async function ArchitectureAdminPage() {
  const projects = await prisma.architectureProject.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Architecture Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Interior · Commercial · Residential</p>
        </div>
        <Link href="/admin/architecture/new">
          <Button size="lg">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ArchitectureList projects={projects} />
    </div>
  )
}