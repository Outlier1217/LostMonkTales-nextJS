import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quiz)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const quiz = await prisma.quiz.update({ where: { id: params.id }, data: body })
    return NextResponse.json(quiz)
  } catch {
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.quiz.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}
