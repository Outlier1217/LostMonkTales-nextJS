import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const publishedOnly = searchParams.get('published') === 'true'

  const portraits = await db.portrait.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(publishedOnly ? { isPublished: true } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(portraits)
}

export async function POST(req: NextRequest) {
  try {
    const { title, image, category, isPublished } = await req.json()

    if (!title || !image || !category) {
      return NextResponse.json({ error: 'title, image and category are required' }, { status: 400 })
    }

    const portrait = await db.portrait.create({
      data: { title, image, category, isPublished: !!isPublished },
    })

    return NextResponse.json(portrait, { status: 201 })
  } catch (err) {
    console.error('Create portrait error:', err)
    return NextResponse.json({ error: 'Failed to create portrait' }, { status: 500 })
  }
}