import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { answers, timeTaken } = await req.json()
    // answers: { [questionId]: selectedOptionId }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let totalMarks = 0
    let obtainedMarks = 0
    let correct = 0
    let wrong = 0
    let skipped = 0

    const results = quiz.questions.map(q => {
      const selected = answers[q.id]
      const isCorrect = selected === q.correctAnswer
      const isSkipped = !selected

      totalMarks += q.marks

      if (isSkipped) {
        skipped++
      } else if (isCorrect) {
        correct++
        obtainedMarks += q.marks
      } else {
        wrong++
        if (quiz.negativeMarking) {
          obtainedMarks -= q.marks * quiz.negativePenalty
        }
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
        isSkipped,
        marks: q.marks,
      }
    })

    obtainedMarks = Math.max(0, obtainedMarks)
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
    const passed = percentage >= quiz.passingPercent

    return NextResponse.json({
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      totalMarks,
      obtainedMarks: parseFloat(obtainedMarks.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(1)),
      passed,
      passingPercent: quiz.passingPercent,
      correct,
      wrong,
      skipped,
      timeTaken,
      negativeMarking: quiz.negativeMarking,
      results,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
