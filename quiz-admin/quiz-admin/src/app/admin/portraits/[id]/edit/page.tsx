import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import PortraitForm from '@/components/portraits/PortraitForm'

export default async function EditPortraitPage({ params }: { params: { id: string } }) {
  const portrait = await prisma.portrait.findUnique({ where: { id: params.id } })
  if (!portrait) notFound()

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-6">Edit Portrait</h1>
      <PortraitForm
        initialData={{
          id: portrait.id,
          title: portrait.title,
          image: portrait.image,
          category: portrait.category,
          isPublished: portrait.isPublished,
        }}
      />
    </div>
  )
}