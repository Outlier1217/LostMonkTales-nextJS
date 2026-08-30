import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function QuizDetailPage({ params }: { params: { id: string } }) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  if (!quiz || !quiz.isPublished) notFound()

  return (
    <main className="lm-page">
      <article className="section-shell py-16 md:py-20">
        <Link href="/quizzes" className="mb-6 inline-flex text-sm font-medium text-[#ca6706] hover:underline">
          ← Back to quizzes
        </Link>

        <div className="rounded-[2rem] border border-[#eadbc0] bg-white/80 p-6 shadow-[0_20px_60px_rgba(23,19,16,0.04)] md:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#5f564f]">
            <span className="lm-mono text-[0.62rem] text-[#ca6706]">{quiz.category}</span>
            <span>•</span>
            <span>{quiz.topic}</span>
            <span>•</span>
            <span>{quiz.difficulty}</span>
          </div>

          <h1 className="lm-display text-4xl leading-tight text-[#171310] md:text-6xl">{quiz.title}</h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#3b342f]">
            {quiz.description || 'A thoughtful challenge crafted from stories, details, and observation.'}
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-[#eddcc4] bg-[#f9e9d2] p-4 sm:grid-cols-3">
            <div>
              <p className="lm-mono text-[0.62rem] text-[#ca6706]">Questions</p>
              <p className="mt-2 text-base text-[#171310]">{quiz.questions.length}</p>
            </div>
            <div>
              <p className="lm-mono text-[0.62rem] text-[#ca6706]">Passing</p>
              <p className="mt-2 text-base text-[#171310]">{quiz.passingPercent}%</p>
            </div>
            <div>
              <p className="lm-mono text-[0.62rem] text-[#ca6706]">Time</p>
              <p className="mt-2 text-base text-[#171310]">{quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'}</p>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {quiz.questions.map((question, index) => {
              const options = Array.isArray(question.options)
                ? question.options.filter((option): option is { id: string; text: string } => {
                    return !!option && typeof option === 'object' && 'id' in option && 'text' in option
                  })
                : []

              return (
                <div key={question.id} className="rounded-[1.6rem] border border-[#eadbc0] bg-white/75 p-5 md:p-6">
                  <p className="lm-mono mb-3 text-[0.62rem] text-[#ca6706]">Question {index + 1}</p>
                  <h2 className="text-2xl font-medium text-[#171310] md:text-3xl">{question.questionText}</h2>
                  <ul className="mt-5 space-y-3">
                    {options.map((option, optionIndex) => (
                      <li key={option.id} className="flex items-start gap-3 rounded-[1rem] border border-[#eddcc4] bg-[#faf7f3] px-4 py-3 text-base text-[#3b342f]">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f2801c] text-xs font-semibold text-[#171310]">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span>{option.text}</span>
                      </li>
                    ))}
                  </ul>

                  {question.explanation && (
                    <div className="mt-5 rounded-[1rem] border border-[#eadbc0] bg-[#f9e9d2] p-4 text-base leading-7 text-[#3b342f]">
                      <span className="font-semibold text-[#171310]">Explanation:</span> {question.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </article>
    </main>
  )
}
