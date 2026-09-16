import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const targetFields = {
  QUIZ: 'quizId',
  BLOG: 'blogId',
  ARTWORK: 'artworkId',
} as const

type BookmarkType = keyof typeof targetFields

async function getUserId() {
  const session = await getUserSession()
  return session && typeof session.userId === 'string' ? session.userId : null
}

export async function GET(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as BookmarkType | null
  const itemId = searchParams.get('id')
  if (!type || !itemId || !(type in targetFields)) {
    return NextResponse.json({ error: 'Invalid bookmark target' }, { status: 400 })
  }

  const bookmark = await prisma.bookmark.findFirst({
    where: { userId, type, [targetFields[type]]: itemId },
    select: { id: true },
  })
  return NextResponse.json({ bookmarked: Boolean(bookmark) })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await request.json()
  const type = body.type as BookmarkType
  const itemId = typeof body.id === 'string' ? body.id : ''
  if (!itemId || !(type in targetFields)) {
    return NextResponse.json({ error: 'Invalid bookmark target' }, { status: 400 })
  }

  const field = targetFields[type]
  const bookmark = await prisma.bookmark.findFirst({
    where: { userId, type, [field]: itemId },
  })
  if (bookmark) return NextResponse.json({ bookmarked: true })

  const created = await prisma.bookmark.create({
    data: { userId, type, [field]: itemId },
  })
  return NextResponse.json({ bookmarked: true, id: created.id }, { status: 201 })
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await request.json()
  const type = body.type as BookmarkType
  const itemId = typeof body.id === 'string' ? body.id : ''
  if (!itemId || !(type in targetFields)) {
    return NextResponse.json({ error: 'Invalid bookmark target' }, { status: 400 })
  }

  const bookmark = await prisma.bookmark.findFirst({
    where: { userId, type, [targetFields[type]]: itemId },
    select: { id: true },
  })
  if (bookmark) await prisma.bookmark.delete({ where: { id: bookmark.id } })
  return NextResponse.json({ bookmarked: false })
}
