import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const categories = await prisma.artCategory.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { artworks: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, description } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  try {
    const category = await prisma.artCategory.create({ data: { name, slug, description } })
    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
  }
}