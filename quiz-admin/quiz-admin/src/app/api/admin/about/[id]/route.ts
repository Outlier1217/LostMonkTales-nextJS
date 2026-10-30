import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function authorized() {
  return Boolean((await getSession())?.username)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  const person = await prisma.aboutPerson.update({
    where: { id: params.id },
    data: {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      designation: typeof body.designation === 'string' ? body.designation.trim() : undefined,
      bio: typeof body.bio === 'string' ? body.bio.trim() || null : undefined,
      image: typeof body.image === 'string' ? body.image.trim() || null : undefined,
      kind: body.kind === 'FOUNDER' ? 'FOUNDER' : 'TEAM',
      sortOrder: Number(body.sortOrder) || 0,
    },
  })
  return NextResponse.json(person)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.aboutPerson.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
