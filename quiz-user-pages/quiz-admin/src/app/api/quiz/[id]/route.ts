import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id, isPublished: true },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Strip correct answers before sending to client
    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        order: q.order,
        // NO correctAnswer, NO explanation
      }))
    }
    return NextResponse.json(safeQuiz)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
