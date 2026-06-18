import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseCsvToQuestions, generateOptionId } from '@/lib/utils'
import Papa from 'papaparse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const quizId = formData.get('quizId') as string

    if (!file || !quizId) {
      return NextResponse.json({ error: 'Missing file or quizId' }, { status: 400 })
    }

    const text = await file.text()
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
    const parsed = parseCsvToQuestions(data as Record<string, string>[])

    if (parsed.length === 0) {
      return NextResponse.json({ error: 'No valid questions found in file' }, { status: 400 })
    }

    const existingCount = await prisma.question.count({ where: { quizId } })

    const created = await prisma.$transaction(
      parsed.map((q, i) => {
        const optionTexts = [q.option1, q.option2, q.option3, q.option4, q.option5, q.option6]
          .filter(Boolean) as string[]
        const options = optionTexts.map((text, idx) => ({
          id: generateOptionId(idx),
          text,
        }))
        const correctIndex = q.correctAnswer.charCodeAt(0) - 65
        const correctOptionId = generateOptionId(Math.max(0, correctIndex))

        return prisma.question.create({
          data: {
            quizId,
            questionText: q.questionText,
            options,
            correctAnswer: correctOptionId,
            explanation: q.explanation || null,
            marks: q.marks || 1.0,
            order: existingCount + i,
          },
        })
      })
    )

    return NextResponse.json({ imported: created.length }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
