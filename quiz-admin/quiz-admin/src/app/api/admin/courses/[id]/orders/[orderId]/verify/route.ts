import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_: Request, { params }: { params: { id: string; orderId: string } }) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const result = await prisma.$transaction(async tx => {
      const order = await tx.courseOrder.findFirst({ where: { id: params.orderId, courseId: params.id } })
      if (!order) throw new Error('Order not found.')
      if (order.status === 'VERIFIED') return order
      if (order.status !== 'PENDING') throw new Error('Only pending orders can be verified.')
      const verified = await tx.courseOrder.update({ where: { id: order.id }, data: { status: 'VERIFIED', verifiedAt: new Date() } })
      await tx.courseEnrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
        create: { userId: order.userId, courseId: order.courseId, source: 'PURCHASE' },
        update: { source: 'PURCHASE', revokedAt: null, expiresAt: null },
      })
      return verified
    })
    return NextResponse.json({ order: result })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to verify order.' }, { status: 400 })
  }
}
