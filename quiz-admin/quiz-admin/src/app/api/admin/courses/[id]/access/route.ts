import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function admin() { return Boolean((await getSession())?.username) }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [enrollments, grants, orders] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { courseId: params.id }, include: { user: { select: { id: true, email: true, phone: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.courseAccessGrant.findMany({ where: { courseId: params.id }, include: { user: { select: { id: true, email: true, phone: true } }, grantedBy: { select: { email: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.courseOrder.findMany({ where: { courseId: params.id }, include: { user: { select: { id: true, email: true, phone: true } } }, orderBy: { createdAt: 'desc' } }),
  ])
  return NextResponse.json({ enrollments, grants, orders })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json() as { userId?: string; reason?: string; expiresAt?: string }
    if (!body.userId) return NextResponse.json({ error: 'A registered user is required.' }, { status: 400 })
    const grant = await prisma.courseAccessGrant.create({ data: { courseId: params.id, userId: body.userId, grantedById: null, reason: body.reason?.trim() || `Granted by ${session.username}`, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } })
    return NextResponse.json(grant, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to grant access' }, { status: 400 })
  }
}
