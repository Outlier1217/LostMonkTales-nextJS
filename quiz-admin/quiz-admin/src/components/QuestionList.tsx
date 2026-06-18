'use client'
import { useState } from 'react'
import { QuestionForm } from './QuestionForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

interface Option { id: string; text: string }
interface Question {
  id: string
  questionText: string
  options: Option[]
  correctAnswer: string
  explanation?: string
  marks: number
  order: number
}

interface QuestionListProps {
  questions: Question[]
  quizId: string
  onRefresh: () => void
}

export function QuestionList({ questions, quizId, onRefresh }: QuestionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return
    setDeletingId(id)
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    onRefresh()
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-3">📝</div>
        <p className="text-sm">No questions yet. Add your first question above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => (
        <div key={q.id}>
          {editingId === q.id ? (
            <QuestionForm
              quizId={quizId}
              initialData={q}
              onSaved={() => { setEditingId(null); onRefresh() }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div
                className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <div className="flex-none w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{q.questionText}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-500">{q.options.length} options</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-emerald-500">✓ {q.correctAnswer}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => { e.stopPropagation(); setEditingId(q.id) }}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleDelete(q.id) }}
                    loading={deletingId === q.id}
                    className="h-8 w-8 p-0 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  {expandedId === q.id
                    ? <ChevronUp className="w-4 h-4 text-gray-500" />
                    : <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </div>
              </div>

              {expandedId === q.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-2">
                  {q.options.map(opt => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                        opt.id === q.correctAnswer
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-gray-800/50 text-gray-400'
                      }`}
                    >
                      <span className="font-bold flex-none w-5">{opt.id}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {opt.id === q.correctAnswer && <CheckCircle className="w-4 h-4 flex-none" />}
                    </div>
                  ))}
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <p className="text-xs font-semibold text-blue-400 mb-1">Explanation</p>
                      <p className="text-xs text-gray-400">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
