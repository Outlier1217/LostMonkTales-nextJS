import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.architectureProject.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { title, description, location, size, price, category, images, isPublished } = body

  const project = await prisma.architectureProject.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(size !== undefined && { size }),
      ...(price !== undefined && { price }),
      ...(category !== undefined && { category }),
      ...(images !== undefined && { images }),
      ...(isPublished !== undefined && { isPublished }),
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.architectureProject.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}