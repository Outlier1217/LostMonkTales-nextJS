import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileClient } from './ProfileClient'

export const dynamic = 'force-dynamic'

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function ProfilePage() {
  const session = await getUserSession()
  if (!session || typeof session.userId !== 'string') redirect('/')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      bookmarks: {
        orderBy: { createdAt: 'desc' },
        include: { quiz: true, blog: true, artwork: true },
      },
      quizAttempts: {
        orderBy: { createdAt: 'desc' },
        include: { quiz: { select: { id: true, title: true } } },
      },
    },
  })
  if (!user) redirect('/')

  const quizzes = user.bookmarks.filter(bookmark => bookmark.quiz)
  const blogs = user.bookmarks.filter(bookmark => bookmark.blog)
  const artworks = user.bookmarks.filter(bookmark => bookmark.artwork)

  return (
    <main className="lm-page">
      <section className="section-shell py-16 md:py-20">
        <div className="mb-10">
          <p className="lm-mono mb-3 text-[0.68rem] text-[#ca6706]">Your account</p>
          <h1 className="lm-display text-4xl text-[#171310] md:text-6xl">Profile</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f564f]">Keep your details, saved discoveries, and quiz progress together.</p>
        </div>

        <ProfileClient user={{ id: user.id, email: user.email, phone: user.phone, image: user.image }} />

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="lm-mono text-[0.62rem] text-[#ca6706]">Saved for later</p><h2 className="lm-display mt-2 text-3xl text-[#171310]">Bookmarks</h2></div><span className="text-sm text-[#5f564f]">{user.bookmarks.length} saved</span></div>
          <div className="grid gap-5 md:grid-cols-3">
            <BookmarkGroup title="Quizzes" empty="No saved quizzes yet." items={quizzes.map(bookmark => bookmark.quiz && <Link key={bookmark.id} href={`/quizzes/${bookmark.quiz.id}`} className="block text-lg text-[#171310] hover:text-[#ca6706]">{bookmark.quiz.title}</Link>)} />
            <BookmarkGroup title="Blogs" empty="No saved blogs yet." items={blogs.map(bookmark => bookmark.blog && <Link key={bookmark.id} href={`/blogs/${bookmark.blog.id}`} className="block text-lg text-[#171310] hover:text-[#ca6706]">{bookmark.blog.title}</Link>)} />
            <BookmarkGroup title="Store" empty="No saved artwork yet." items={artworks.map(bookmark => bookmark.artwork && <Link key={bookmark.id} href={`/store/${bookmark.artwork.id}`} className="block text-lg text-[#171310] hover:text-[#ca6706]">{bookmark.artwork.title}</Link>)} />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="lm-mono text-[0.62rem] text-[#ca6706]">Your progress</p><h2 className="lm-display mt-2 text-3xl text-[#171310]">Completed quizzes</h2></div><span className="text-sm text-[#5f564f]">{user.quizAttempts.length} attempts</span></div>
          {user.quizAttempts.length === 0 ? <div className="rounded-[1.5rem] border border-[#eadbc0] bg-white/60 p-6 text-[#5f564f]">Complete a quiz and your results will appear here.</div> : <div className="space-y-3">{user.quizAttempts.map(attempt => <Link key={attempt.id} href={`/quizzes/${attempt.quiz.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-[#eadbc0] bg-white/75 p-5 hover:border-[#f2801c]"><div><h3 className="text-lg font-medium text-[#171310]">{attempt.quiz.title}</h3><p className="mt-1 text-sm text-[#5f564f]">{formatDate(attempt.createdAt)} · {attempt.correct} correct · {attempt.wrong} wrong · {attempt.skipped} skipped</p></div><div className="text-right"><p className="text-2xl font-semibold text-[#ca6706]">{Math.round(attempt.percentage)}%</p><p className="text-xs text-[#5f564f]">{attempt.score.toFixed(2)} / {attempt.totalMarks.toFixed(2)}</p></div></Link>)}</div>}
        </section>
      </section>
    </main>
  )
}

function BookmarkGroup({ title, empty, items }: { title: string; empty: string; items: React.ReactNode[] }) {
  return <div className="rounded-[1.5rem] border border-[#eadbc0] bg-white/60 p-5"><h3 className="lm-mono text-[0.62rem] text-[#ca6706]">{title}</h3><div className="mt-4 space-y-3">{items.length ? items : <p className="text-sm text-[#5f564f]">{empty}</p>}</div></div>
}
