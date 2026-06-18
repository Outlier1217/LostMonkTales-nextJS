import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(quizzes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const quiz = await prisma.quiz.create({ data: body })
    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}
