import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { QuizPlayer } from './QuizPlayer'
import { BookmarkButton } from '@/components/public/BookmarkButton'

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

          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="lm-display text-4xl leading-tight text-[#171310] md:text-6xl">{quiz.title}</h1>
            <BookmarkButton type="QUIZ" id={quiz.id} />
          </div>

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

          <div className="mt-10">
            <QuizPlayer
              quiz={{
                id: quiz.id,
                title: quiz.title,
                passingPercent: quiz.passingPercent,
                timeLimit: quiz.timeLimit,
                negativeMarking: quiz.negativeMarking,
                negativePenalty: quiz.negativePenalty,
                questions: quiz.questions.map(question => ({
                  id: question.id,
                  questionText: question.questionText,
                  options: Array.isArray(question.options)
                    ? question.options.filter((option): option is { id: string; text: string } => {
                        return !!option && typeof option === 'object' && 'id' in option && 'text' in option
                      })
                    : [],
                  correctAnswer: question.correctAnswer,
                  explanation: question.explanation,
                  marks: question.marks,
                })),
              }}
            />
          </div>
        </div>
      </article>
    </main>
  )
}
