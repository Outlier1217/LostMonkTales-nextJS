import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = new URL(request.url).searchParams.get('q')?.trim() || ''
  if (q.length < 2) return NextResponse.json([])
  return NextResponse.json(await prisma.user.findMany({ where: { OR: [{ email: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }] }, select: { id: true, email: true, phone: true }, take: 20 }))
}
