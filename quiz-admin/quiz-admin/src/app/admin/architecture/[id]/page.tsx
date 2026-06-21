import { prisma } from '@/lib/db'
import { ArchitectureForm } from '@/components/architecture/ArchitectureForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditArchitectureProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.architectureProject.findUnique({ where: { id: params.id } })
  if (!project) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Edit Project</h1>
      <ArchitectureForm
        project={{
          ...project,
          images: Array.isArray(project.images) ? (project.images as string[]) : [],
        }}
      />
    </div>
  )
}