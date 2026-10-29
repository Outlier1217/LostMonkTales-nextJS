import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getUserSession()
  if (!session || typeof session.userId !== 'string') return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, status: true, accessType: true, price: true, currency: true } })
  if (!course || course.status !== 'PUBLISHED') return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  if (course.accessType !== 'PAID' || course.price == null) return NextResponse.json({ error: 'This course does not require payment.' }, { status: 400 })

  const existing = await prisma.courseOrder.findFirst({
    where: { userId: session.userId, courseId: course.id, status: { in: ['PENDING', 'VERIFIED'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (existing) return NextResponse.json({ order: existing, alreadyExists: true })

  const order = await prisma.courseOrder.create({
    data: { userId: session.userId, courseId: course.id, amount: course.price, currency: course.currency, status: 'PENDING', provider: 'manual' },
  })
  return NextResponse.json({ order, message: 'Payment request submitted. An administrator must verify it before access is granted.' }, { status: 201 })
}
