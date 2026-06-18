import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, BookOpen, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [quizzes, totalQuestions] = await Promise.all([
    prisma.quiz.findMany({ include: { _count: { select: { questions: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.question.count(),
  ])

  const stats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.isPublished).length,
    totalQuestions,
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your quiz content</p>
        </div>
        <Link href="/admin/quizzes/new">
          <Button size="lg">
            <Plus className="w-4 h-4" />
            New Quiz
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Quizzes', value: stats.total, icon: BookOpen, color: 'text-violet-400' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Total Questions', value: totalQuestions, icon: CheckCircle, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-200">Recent Quizzes</h2>
          <Link href="/admin/quizzes" className="text-sm text-violet-400 hover:text-violet-300">View all →</Link>
        </div>
        <div className="space-y-2">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-gray-500 text-sm">No quizzes yet.</p>
              <Link href="/admin/quizzes/new" className="text-violet-400 text-sm mt-2 block hover:text-violet-300">
                Create your first quiz →
              </Link>
            </div>
          ) : quizzes.map(quiz => (
            <Link
              key={quiz.id}
              href={`/admin/quizzes/${quiz.id}/questions`}
              className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{quiz.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{quiz.category} · {quiz.topic}</p>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Badge variant={quiz.difficulty.toLowerCase() as any}>{quiz.difficulty}</Badge>
                <Badge variant={quiz.isPublished ? 'published' : 'draft'}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-xs text-gray-500">{quiz._count.questions}Q</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
