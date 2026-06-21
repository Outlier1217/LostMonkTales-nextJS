import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
  return NextResponse.json(artworks)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, description, price, contact, images, categoryId } = body
  if (!title || !price || !contact || !categoryId || !images?.length)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const artwork = await prisma.artwork.create({
    data: { title, description, price: parseFloat(price), contact, images, categoryId },
  })
  return NextResponse.json(artwork, { status: 201 })
}