'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Option = { id: string; text: string }

type QuizQuestion = {
  id: string
  questionText: string
  options: Option[]
  correctAnswer: string
  explanation: string | null
  marks: number
}

type QuizPlayerProps = {
  quiz: {
    id: string
    title: string
    passingPercent: number
    timeLimit: number
    negativeMarking: boolean
    negativePenalty: number
    questions: QuizQuestion[]
  }
}

type Result = {
  score: number
  totalMarks: number
  percentage: number
  correct: number
  wrong: number
  skipped: number
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : null)
  const [result, setResult] = useState<Result | null>(null)

  const currentQuestion = quiz.questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalMarks = useMemo(
    () => quiz.questions.reduce((total, question) => total + question.marks, 0),
    [quiz.questions],
  )

  function finishQuiz() {
    let score = 0
    let correct = 0
    let wrong = 0

    for (const question of quiz.questions) {
      const answer = answers[question.id]
      if (!answer) continue
      if (answer === question.correctAnswer) {
        correct += 1
        score += question.marks
      } else {
        wrong += 1
        if (quiz.negativeMarking) score -= question.marks * quiz.negativePenalty
      }
    }

    const skipped = quiz.questions.length - correct - wrong
    const percentage = totalMarks > 0 ? Math.max(0, (score / totalMarks) * 100) : 0
    setResult({ score: Math.max(0, score), totalMarks, percentage, correct, wrong, skipped })
  }

  useEffect(() => {
    if (result || secondsLeft === null) return
    if (secondsLeft <= 0) {
      finishQuiz()
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft(current => current === null ? null : current - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [result, secondsLeft])

  if (quiz.questions.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[#eadbc0] bg-[#f9e9d2] p-6 text-[#5f564f]">
        This quiz does not have any questions yet.
      </div>
    )
  }

  if (result) {
    const passed = result.percentage >= quiz.passingPercent

    return (
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-[#eadbc0] bg-[#f9e9d2] p-6 text-center md:p-10">
          <p className="lm-mono text-[0.62rem] text-[#ca6706]">Quiz complete</p>
          <h2 className="lm-display mt-3 text-4xl text-[#171310] md:text-5xl">
            {passed ? 'You passed' : 'Keep exploring'}
          </h2>
          <p className="mt-3 text-[#5f564f]">
            You scored {result.score.toFixed(2)} out of {result.totalMarks.toFixed(2)} marks.
          </p>
          <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full border-8 border-[#f2801c] bg-white text-3xl font-semibold text-[#171310]">
            {Math.round(result.percentage)}%
          </div>
          <p className="mt-5 text-sm text-[#5f564f]">Passing score: {quiz.passingPercent}%</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Correct', result.correct, 'text-emerald-700'],
            ['Wrong', result.wrong, 'text-red-700'],
            ['Skipped', result.skipped, 'text-[#5f564f]'],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-[1.25rem] border border-[#eadbc0] bg-white/75 p-5 text-center">
              <p className={`text-3xl font-semibold ${color}`}>{value}</p>
              <p className="mt-1 text-sm text-[#5f564f]">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="lm-display text-3xl text-[#171310]">Review your answers</h3>
          {quiz.questions.map((question, index) => {
            const answer = answers[question.id]
            const correct = answer === question.correctAnswer
            const selectedOption = question.options.find(option => option.id === answer)
            const correctOption = question.options.find(option => option.id === question.correctAnswer)

            return (
              <div key={question.id} className="rounded-[1.5rem] border border-[#eadbc0] bg-white/75 p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="lm-mono text-[0.62rem] text-[#ca6706]">Question {index + 1}</p>
                  <span className={`text-sm font-semibold ${correct ? 'text-emerald-700' : 'text-red-700'}`}>
                    {correct ? 'Correct' : answer ? 'Incorrect' : 'Skipped'}
                  </span>
                </div>
                <h4 className="mt-3 text-xl font-medium text-[#171310]">{question.questionText}</h4>
                {selectedOption && !correct && <p className="mt-3 text-sm text-red-700">Your answer: {selectedOption.text}</p>}
                <p className="mt-2 text-sm text-emerald-700">Correct answer: {correctOption?.text}</p>
                {question.explanation && <p className="mt-3 border-t border-[#eadbc0] pt-3 text-sm leading-6 text-[#5f564f]">{question.explanation}</p>}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => { setAnswers({}); setResult(null); setCurrentIndex(0); setSecondsLeft(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : null) }} className="rounded-full bg-[#171310] px-5 py-3 text-sm font-medium text-[#f7f2eb] hover:bg-[#2a241f]">
            Try again
          </button>
          <Link href="/quizzes" className="rounded-full border border-[#c7b7a5] px-5 py-3 text-sm font-medium text-[#171310] hover:border-[#f2801c]">
            More quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[#eadbc0] bg-white/75 p-5 md:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="lm-mono text-[0.62rem] text-[#ca6706]">Question {currentIndex + 1} of {quiz.questions.length}</p>
          <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-[#eadbc0] sm:w-64">
            <div className="h-full rounded-full bg-[#f2801c] transition-all" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="text-right">
          {secondsLeft !== null && <p className={`font-semibold ${secondsLeft < 60 ? 'text-red-700' : 'text-[#171310]'}`}>{formatTime(secondsLeft)}</p>}
          <p className="mt-1 text-xs text-[#5f564f]">{answeredCount} answered</p>
        </div>
      </div>

      <h2 className="text-2xl font-medium leading-tight text-[#171310] md:text-3xl">{currentQuestion.questionText}</h2>
      <div className="mt-6 space-y-3">
        {currentQuestion.options.map((option, optionIndex) => {
          const selected = answers[currentQuestion.id] === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setAnswers(current => ({ ...current, [currentQuestion.id]: option.id }))}
              className={`flex w-full items-start gap-3 rounded-[1rem] border px-4 py-4 text-left text-base transition ${selected ? 'border-[#f2801c] bg-[#f9e9d2] text-[#171310]' : 'border-[#eddcc4] bg-[#faf7f3] text-[#3b342f] hover:border-[#f2801c]'}`}
            >
              <span className={`mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-semibold ${selected ? 'bg-[#f2801c] text-[#171310]' : 'bg-[#eadbc0] text-[#5f564f]'}`}>
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option.text}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={() => setCurrentIndex(index => Math.max(0, index - 1))} disabled={currentIndex === 0} className="rounded-full border border-[#c7b7a5] px-5 py-3 text-sm font-medium text-[#171310] disabled:cursor-not-allowed disabled:opacity-40">
          Previous
        </button>
        {currentIndex === quiz.questions.length - 1 ? (
          <button type="button" onClick={finishQuiz} className="rounded-full bg-[#f2801c] px-5 py-3 text-sm font-semibold text-[#171310] hover:bg-[#ff9a3d]">
            Finish quiz
          </button>
        ) : (
          <button type="button" onClick={() => setCurrentIndex(index => Math.min(quiz.questions.length - 1, index + 1))} className="rounded-full bg-[#171310] px-5 py-3 text-sm font-medium text-[#f7f2eb] hover:bg-[#2a241f]">
            Next question
          </button>
        )}
      </div>
    </div>
  )
}