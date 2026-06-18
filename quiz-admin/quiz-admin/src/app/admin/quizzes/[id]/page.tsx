import { prisma } from '@/lib/db'
import { QuizForm } from '@/components/QuizForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const quiz = await prisma.quiz.findUnique({ where: { id: params.id } })
  if (!quiz) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Edit Quiz</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{quiz.title}</p>
      </div>
      <QuizForm mode="edit" initialData={quiz} />
    </div>
  )
}
