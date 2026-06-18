import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, Clock, Target, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function QuizListPage() {
  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-100">Outlier Lab Quizzes</span>
          </div>
          <Link href="/admin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Admin →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-3">Practice Quizzes</h1>
          <p className="text-gray-500">Test your knowledge with our curated quiz collection</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-400">No quizzes published yet.</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quizzes.map(quiz => (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.id}`}
                className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-gray-900/80 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h2 className="text-base font-semibold text-gray-100 group-hover:text-violet-300 transition-colors leading-snug">
                    {quiz.title}
                  </h2>
                  <Badge variant={quiz.difficulty.toLowerCase() as any} className="shrink-0">
                    {quiz.difficulty}
                  </Badge>
                </div>

                {quiz.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description}</p>
                )}

                <div className="flex items-center gap-1 mb-4">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{quiz.category}</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{quiz.topic}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                    {quiz._count.questions}Q
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    {quiz.timeLimit === 0 ? 'No limit' : `${quiz.timeLimit}m`}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Target className="w-3.5 h-3.5 text-gray-600" />
                    Pass {quiz.passingPercent}%
                  </div>
                </div>

                {quiz.negativeMarking && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-500/80">
                    <AlertTriangle className="w-3 h-3" />
                    Negative marking enabled
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
