import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({ where: { id: params.id } })
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(blog)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const blog = await prisma.blog.update({
    where: { id: params.id },
    data: {
      title: body.title,
      category: body.category,
      topic: body.topic,
      content: body.content,
      youtubeUrl: body.youtubeUrl || null,
      isPublished: body.isPublished,
      updatedAt: new Date(),
    },
  })
  return NextResponse.json(blog)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blog.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}