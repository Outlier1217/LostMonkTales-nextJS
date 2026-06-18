'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuestionForm } from '@/components/QuestionForm'
import { QuestionList } from '@/components/QuestionList'
import { ImportModal } from '@/components/ImportModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Upload, ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  difficulty: string
  category: string
  topic: string
  timeLimit: number
  negativeMarking: boolean
  passingPercent: number
  isPublished: boolean
  questions: any[]
}

export default function QuestionsPage() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  async function fetchQuiz() {
    const res = await fetch(`/api/quizzes/${quizId}`)
    const data = await res.json()
    setQuiz(data)
    setLoading(false)
  }

  useEffect(() => { fetchQuiz() }, [quizId])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!quiz) return <div className="p-8 text-gray-500">Quiz not found</div>

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/quizzes" className="mt-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-100 truncate">{quiz.title}</h1>
            <Badge variant={quiz.difficulty.toLowerCase() as any}>{quiz.difficulty}</Badge>
            <Badge variant={quiz.isPublished ? 'published' : 'draft'}>
              {quiz.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {quiz.category} · {quiz.topic} · {quiz.timeLimit === 0 ? 'No time limit' : `${quiz.timeLimit} min`} · Pass: {quiz.passingPercent}%
            {quiz.negativeMarking && ' · Negative marking'}
          </p>
        </div>
        <Link href={`/admin/quizzes/${quizId}`}>
          <Button variant="secondary" size="sm"><Pencil className="w-3.5 h-3.5" /> Edit Quiz</Button>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="text-gray-100 font-semibold">{quiz.questions.length}</span> questions
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="w-3.5 h-3.5" />
            Import CSV/Excel
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <QuestionForm
          quizId={quizId}
          onSaved={() => { setShowAddForm(false); fetchQuiz() }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Questions List */}
      <QuestionList
        questions={quiz.questions}
        quizId={quizId}
        onRefresh={fetchQuiz}
      />

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          quizId={quizId}
          onClose={() => setShowImport(false)}
          onSuccess={fetchQuiz}
        />
      )}
    </div>
  )
}
