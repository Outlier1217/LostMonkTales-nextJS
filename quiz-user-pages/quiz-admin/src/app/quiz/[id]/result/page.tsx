'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, MinusCircle, Trophy, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AnswerResult {
  questionId: string
  questionText: string
  options: { id: string; text: string }[]
  selected?: string
  correctAnswer: string
  explanation?: string
  isCorrect: boolean
  isSkipped: boolean
  marks: number
}

interface QuizResult {
  quizTitle: string
  totalQuestions: number
  totalMarks: number
  obtainedMarks: number
  percentage: number
  passed: boolean
  passingPercent: number
  correct: number
  wrong: number
  skipped: number
  timeTaken: number
  negativeMarking: boolean
  results: AnswerResult[]
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const [result, setResult] = useState<QuizResult | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-result-${quizId}`)
    if (stored) setResult(JSON.parse(stored))
    else router.push(`/quiz/${quizId}`)
  }, [quizId, router])

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m === 0) return `${s}s`
    return `${m}m ${s}s`
  }

  if (!result) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  )

  const scoreColor = result.passed ? 'text-emerald-400' : 'text-red-400'
  const scoreBg = result.passed ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/quiz" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← All Quizzes</Link>
          <Link href={`/quiz/${quizId}`}>
            <Button variant="secondary" size="sm">
              <RotateCcw className="w-3.5 h-3.5" /> Retake
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Score card */}
        <div className={`bg-gradient-to-b ${scoreBg} border rounded-3xl p-8 text-center`}>
          <div className="mb-4">
            {result.passed
              ? <Trophy className="w-14 h-14 text-emerald-400 mx-auto" />
              : <XCircle className="w-14 h-14 text-red-400 mx-auto" />
            }
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{result.quizTitle}</p>
          <div className={`text-6xl font-bold mb-1 ${scoreColor}`}>{result.percentage}%</div>
          <p className={`text-lg font-semibold mb-4 ${scoreColor}`}>
            {result.passed ? '🎉 Passed!' : '❌ Failed'}
          </p>
          <p className="text-sm text-gray-500">
            {result.obtainedMarks} / {result.totalMarks} marks · Passing: {result.passingPercent}%
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Correct', value: result.correct, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Wrong', value: result.wrong, icon: XCircle, color: 'text-red-400' },
            { label: 'Skipped', value: result.skipped, icon: MinusCircle, color: 'text-gray-400' },
            { label: 'Time', value: formatTime(result.timeTaken), icon: Clock, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Detailed Review */}
        <div>
          <h2 className="text-base font-semibold text-gray-200 mb-3">Answer Review</h2>
          <div className="space-y-3">
            {result.results.map((r, idx) => (
              <div
                key={r.questionId}
                className={`border rounded-xl overflow-hidden ${
                  r.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' :
                  r.isSkipped ? 'border-gray-800 bg-gray-900/50' :
                  'border-red-500/30 bg-red-500/5'
                }`}
              >
                <button
                  className="w-full flex items-start gap-3 p-4 text-left"
                  onClick={() => setExpanded(expanded === r.questionId ? null : r.questionId)}
                >
                  <div className="shrink-0 mt-0.5">
                    {r.isCorrect
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                      : r.isSkipped
                      ? <MinusCircle className="w-5 h-5 text-gray-500" />
                      : <XCircle className="w-5 h-5 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Q{idx + 1} · {r.marks} mark{r.marks !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-gray-200 leading-snug">{r.questionText}</p>
                  </div>
                  {expanded === r.questionId
                    ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  }
                </button>

                {expanded === r.questionId && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-800/50 pt-3">
                    {r.options.map(opt => {
                      const isCorrect = opt.id === r.correctAnswer
                      const isSelected = opt.id === r.selected
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                            isCorrect
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : isSelected && !isCorrect
                              ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                              : 'bg-gray-800/40 text-gray-500'
                          }`}
                        >
                          <span className="font-bold w-5 shrink-0">{opt.id}.</span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && <CheckCircle className="w-4 h-4 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                        </div>
                      )
                    })}

                    {r.isSkipped && (
                      <p className="text-xs text-gray-500 pt-1">You skipped this question.</p>
                    )}

                    {r.explanation && (
                      <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-400 mb-1">💡 Explanation</p>
                        <p className="text-xs text-gray-400">{r.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Link href={`/quiz/${quizId}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </Button>
          </Link>
          <Link href="/quiz" className="flex-1">
            <Button className="w-full">All Quizzes →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
