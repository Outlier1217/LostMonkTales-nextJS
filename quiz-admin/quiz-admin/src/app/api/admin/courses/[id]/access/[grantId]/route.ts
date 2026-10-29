import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_: Request, { params }: { params: { id: string; grantId: string } }) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const grant = await prisma.courseAccessGrant.updateMany({ where: { id: params.grantId, courseId: params.id, revokedAt: null }, data: { revokedAt: new Date() } })
  return grant.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Grant not found' }, { status: 404 })
}
