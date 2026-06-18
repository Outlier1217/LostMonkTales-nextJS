'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, BookOpen, Target, Send } from 'lucide-react'

interface Option { id: string; text: string }
interface Question {
  id: string
  questionText: string
  options: Option[]
  marks: number
  order: number
}
interface Quiz {
  id: string
  title: string
  description?: string
  difficulty: string
  category: string
  topic: string
  timeLimit: number
  negativeMarking: boolean
  negativePenalty: number
  passingPercent: number
  questions: Question[]
}

type Phase = 'intro' | 'quiz' | 'submitting'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetch(`/api/quiz/${quizId}`)
      .then(r => r.json())
      .then(data => { setQuiz(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [quizId])

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!quiz) return
    setPhase('submitting')
    const taken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    setTimeTaken(taken)
    clearInterval(timerRef.current)

    const res = await fetch(`/api/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, timeTaken: taken }),
    })
    const result = await res.json()
    // Store result in sessionStorage and redirect
    sessionStorage.setItem(`quiz-result-${quizId}`, JSON.stringify(result))
    router.push(`/quiz/${quizId}/result`)
  }, [quiz, quizId, answers, router])

  // Timer
  useEffect(() => {
    if (phase !== 'quiz' || !quiz || quiz.timeLimit === 0) return
    startTimeRef.current = Date.now()
    setTimeLeft(quiz.timeLimit * 60)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [phase, quiz, handleSubmit])

  // Track time taken (no limit mode)
  useEffect(() => {
    if (phase !== 'quiz' || !quiz || quiz.timeLimit !== 0) return
    startTimeRef.current = Date.now()
  }, [phase, quiz])

  function startQuiz() {
    setPhase('quiz')
    setCurrent(0)
    setAnswers({})
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const answered = Object.keys(answers).length
  const totalQ = quiz?.questions.length || 0

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!quiz) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
      Quiz not found or not published.
    </div>
  )

  // INTRO SCREEN
  if (phase === 'intro') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              quiz.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              quiz.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>{quiz.difficulty}</span>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{quiz.category}</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">{quiz.title}</h1>
            {quiz.description && <p className="text-sm text-gray-500">{quiz.description}</p>}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: 'Questions', value: `${totalQ}` },
              { icon: Clock, label: 'Time Limit', value: quiz.timeLimit === 0 ? 'Unlimited' : `${quiz.timeLimit} min` },
              { icon: Target, label: 'Passing Score', value: `${quiz.passingPercent}%` },
              { icon: AlertTriangle, label: 'Negative Marking', value: quiz.negativeMarking ? `Yes (-${quiz.negativePenalty}× per wrong)` : 'No' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-200">{s.value}</p>
              </div>
            ))}
          </div>

          {quiz.negativeMarking && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-400">
                Wrong answers will deduct <strong>{quiz.negativePenalty}×</strong> marks. Skip if unsure.
              </p>
            </div>
          )}

          <Button onClick={startQuiz} size="lg" className="w-full">
            Start Quiz →
          </Button>
        </div>
      </div>
    </div>
  )

  // SUBMITTING
  if (phase === 'submitting') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-400">Evaluating your answers...</p>
      </div>
    </div>
  )

  // QUIZ SCREEN
  const question = quiz.questions[current]
  const isLast = current === totalQ - 1
  const timePercent = quiz.timeLimit > 0 ? (timeLeft / (quiz.timeLimit * 60)) * 100 : 100
  const isTimeWarning = quiz.timeLimit > 0 && timeLeft < 60

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{quiz.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-300"
                  style={{ width: `${((current + 1) / totalQ) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 shrink-0">{current + 1}/{totalQ}</span>
            </div>
          </div>

          {quiz.timeLimit > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold shrink-0 ${
              isTimeWarning ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}

          <span className="text-xs text-gray-500 shrink-0">{answered}/{totalQ} answered</span>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Question number + text */}
        <div>
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
            Question {current + 1} · {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </p>
          <p className="text-lg text-gray-100 leading-relaxed">{question.questionText}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {(question.options as Option[]).map((opt) => {
            const selected = answers[question.id] === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => selectAnswer(question.id, opt.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selected
                    ? 'border-violet-500 bg-violet-500/10 text-gray-100'
                    : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  selected ? 'border-violet-500 bg-violet-600 text-white' : 'border-gray-700 text-gray-500'
                }`}>
                  {opt.id}
                </div>
                <span className="text-sm leading-relaxed">{opt.text}</span>
              </button>
            )
          })}
        </div>

        {/* Question palette */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 mb-3">Jump to question</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  i === current
                    ? 'bg-violet-600 text-white'
                    : answers[q.id]
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>

          <div className="flex items-center gap-2">
            {answers[question.id] && (
              <button
                onClick={() => setAnswers(prev => { const n = {...prev}; delete n[question.id]; return n })}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2"
              >
                Clear
              </button>
            )}

            {isLast ? (
              <Button
                onClick={() => handleSubmit(false)}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <Send className="w-4 h-4" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
