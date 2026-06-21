import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
    include: { category: true },
  })
  if (!artwork) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(artwork)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const artwork = await prisma.artwork.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      price: body.price ? parseFloat(body.price) : undefined,
      contact: body.contact,
      images: body.images,
      categoryId: body.categoryId,
      isPublished: body.isPublished,
    },
  })
  return NextResponse.json(artwork)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.artwork.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}