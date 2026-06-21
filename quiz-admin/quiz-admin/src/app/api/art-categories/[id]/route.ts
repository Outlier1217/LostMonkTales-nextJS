import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const category = await prisma.artCategory.update({
    where: { id: params.id },
    data: { name: body.name, description: body.description },
  })
  return NextResponse.json(category)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.artCategory.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}