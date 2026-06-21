import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const projects = await prisma.architectureProject.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, description, location, size, price, category, images, isPublished } = body

  if (!title || !category || !images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: 'title, category aur kam se kam 1 image zaroori hai' }, { status: 400 })
  }

  const project = await prisma.architectureProject.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      size: size || null,
      price: price || null,
      category,
      images,
      isPublished: !!isPublished,
    },
  })

  return NextResponse.json(project)
}