import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getUserSession()
  if (!session || typeof session.userId !== 'string') {
    return NextResponse.json({ error: 'Sign in required to save quiz results' }, { status: 401 })
  }

  const body = await request.json()
  const quizId = typeof body.quizId === 'string' ? body.quizId : ''
  const numericFields = ['score', 'totalMarks', 'percentage', 'correct', 'wrong', 'skipped'] as const
  if (!quizId || numericFields.some(field => typeof body[field] !== 'number' || !Number.isFinite(body[field]))) {
    return NextResponse.json({ error: 'Invalid quiz result' }, { status: 400 })
  }

  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, isPublished: true }, select: { id: true } })
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.userId,
      quizId,
      score: body.score,
      totalMarks: body.totalMarks,
      percentage: body.percentage,
      correct: body.correct,
      wrong: body.wrong,
      skipped: body.skipped,
    },
  })
  return NextResponse.json({ success: true, id: attempt.id }, { status: 201 })
}
