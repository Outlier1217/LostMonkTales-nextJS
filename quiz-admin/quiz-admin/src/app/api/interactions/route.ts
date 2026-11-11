import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const targetTypes = ['BLOG', 'QUIZ', 'COURSE', 'ARTWORK', 'PORTRAIT'] as const
type TargetType = typeof targetTypes[number]

async function userId() {
  const session = await getUserSession()
  return session && typeof session.userId === 'string' ? session.userId : null
}

async function validTarget(type: TargetType, id: string) {
  const where = { id, isPublished: true }
  if (type === 'BLOG') return Boolean(await prisma.blog.findFirst({ where, select: { id: true } }))
  if (type === 'QUIZ') return Boolean(await prisma.quiz.findFirst({ where, select: { id: true } }))
  if (type === 'COURSE') return Boolean(await prisma.course.findFirst({ where: { id, status: 'PUBLISHED' }, select: { id: true } }))
  if (type === 'ARTWORK') return Boolean(await prisma.artwork.findFirst({ where, select: { id: true } }))
  return Boolean(await prisma.portrait.findFirst({ where, select: { id: true } }))
}

async function requestTarget(request: Request) {
  const body = await request.json().catch(() => ({}))
  const type = body.targetType as TargetType
  const id = typeof body.targetId === 'string' ? body.targetId : ''
  if (!targetTypes.includes(type) || !id || !(await validTarget(type, id))) return null
  return { type, id, body }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('targetType') as TargetType
  const targetId = searchParams.get('targetId') || ''
  if (!targetTypes.includes(targetType) || !(await validTarget(targetType, targetId))) return NextResponse.json({ error: 'Invalid target' }, { status: 400 })
  const currentUserId = await userId()
  const [likes, comments, liked] = await Promise.all([
    prisma.contentLike.count({ where: { targetType, targetId } }),
    prisma.contentComment.findMany({
      where: { targetType, targetId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true } }, replies: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true } } } } },
    }),
    currentUserId ? prisma.contentLike.findUnique({ where: { userId_targetType_targetId: { userId: currentUserId, targetType, targetId } } }) : null,
  ])
  return NextResponse.json({ likes, liked: Boolean(liked), comments })
}

export async function POST(request: Request) {
  const currentUserId = await userId()
  if (!currentUserId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const target = await requestTarget(request)
  if (!target) return NextResponse.json({ error: 'Invalid target' }, { status: 400 })
  const action = target.body.action
  if (action === 'like') {
    await prisma.contentLike.upsert({
      where: { userId_targetType_targetId: { userId: currentUserId, targetType: target.type, targetId: target.id } },
      create: { userId: currentUserId, targetType: target.type, targetId: target.id },
      update: {},
    })
    return NextResponse.json({ liked: true })
  }
  if (action === 'share') {
    const result = target.body.result && typeof target.body.result === 'object' ? target.body.result : undefined
    await prisma.contentShare.create({ data: { userId: currentUserId, targetType: target.type, targetId: target.id, result } })
    return NextResponse.json({ shared: true })
  }
  if (action === 'comment') {
    const body = typeof target.body.body === 'string' ? target.body.body.trim() : ''
    const parentId = typeof target.body.parentId === 'string' ? target.body.parentId : null
    if (!body || body.length > 2000) return NextResponse.json({ error: 'Comment must be between 1 and 2000 characters' }, { status: 400 })
    if (parentId) {
      const parent = await prisma.contentComment.findFirst({ where: { id: parentId, targetType: target.type, targetId: target.id } })
      if (!parent) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }
    const comment = await prisma.contentComment.create({ data: { userId: currentUserId, targetType: target.type, targetId: target.id, body, parentId }, include: { user: { select: { id: true } } } })
    return NextResponse.json({ comment }, { status: 201 })
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(request: Request) {
  const currentUserId = await userId()
  if (!currentUserId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const target = await requestTarget(request)
  if (!target || target.body.action !== 'like') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  await prisma.contentLike.deleteMany({ where: { userId: currentUserId, targetType: target.type, targetId: target.id } })
  return NextResponse.json({ liked: false })
}
