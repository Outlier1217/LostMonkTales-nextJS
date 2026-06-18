import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get('quizId')
  try {
    const questions = await prisma.question.findMany({
      where: quizId ? { quizId } : undefined,
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(questions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Get next order number
    const count = await prisma.question.count({ where: { quizId: body.quizId } })
    const question = await prisma.question.create({
      data: { ...body, order: count },
    })
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
