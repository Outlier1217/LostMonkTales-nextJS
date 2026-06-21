import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const portrait = await db.portrait.findUnique({ where: { id: params.id } })
  if (!portrait) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(portrait)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, image, category, isPublished } = await req.json()

    const portrait = await db.portrait.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    })

    return NextResponse.json(portrait)
  } catch (err) {
    console.error('Update portrait error:', err)
    return NextResponse.json({ error: 'Failed to update portrait' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const portrait = await db.portrait.findUnique({ where: { id: params.id } })
    if (!portrait) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // VPS se bhi cleanup, fail ho to bhi DB delete continue rahega
    try {
      const filename = portrait.image.split('/').pop()
      await fetch(`${process.env.FILE_SERVER_URL || 'http://88.222.244.226:3021'}/uploads/${filename}`, {
        method: 'DELETE',
      })
    } catch {}

    await db.portrait.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete portrait error:', err)
    return NextResponse.json({ error: 'Failed to delete portrait' }, { status: 500 })
  }
}