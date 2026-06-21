import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    for (const item of items) {
      if (!item.title?.trim() || !item.image || !item.category) {
        return NextResponse.json({ error: 'Har entry me title, image, category zaroori hai' }, { status: 400 })
      }
    }

    const result = await prisma.portrait.createMany({
      data: items.map((item: any) => ({
        title: item.title.trim(),
        image: item.image,
        category: item.category,
        isPublished: !!item.isPublished,
      })),
    })

    return NextResponse.json({ count: result.count }, { status: 201 })
  } catch (err) {
    console.error('Bulk create error:', err)
    return NextResponse.json({ error: 'Failed to save portraits' }, { status: 500 })
  }
}