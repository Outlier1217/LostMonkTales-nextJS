import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Pencil, FileQuestion } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">All Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">{quizzes.length} quizzes total</p>
        </div>
        <Link href="/admin/quizzes/new">
          <Button><Plus className="w-4 h-4" /> New Quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-400 font-medium">No quizzes yet</p>
          <p className="text-gray-600 text-sm mt-1 mb-4">Create your first quiz to get started</p>
          <Link href="/admin/quizzes/new"><Button>Create Quiz</Button></Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {quizzes.map(quiz => (
                <tr key={quiz.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-200">{quiz.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{quiz.category} · {quiz.topic}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant={quiz.difficulty.toLowerCase() as any}>{quiz.difficulty}</Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-300">{quiz._count.questions}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-300">
                      {quiz.timeLimit === 0 ? 'Unlimited' : `${quiz.timeLimit}m`}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={quiz.isPublished ? 'published' : 'draft'}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/quizzes/${quiz.id}`}>
                        <Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5" /></Button>
                      </Link>
                      <Link href={`/admin/quizzes/${quiz.id}/questions`}>
                        <Button variant="secondary" size="sm">
                          <FileQuestion className="w-3.5 h-3.5" />
                          Questions
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
