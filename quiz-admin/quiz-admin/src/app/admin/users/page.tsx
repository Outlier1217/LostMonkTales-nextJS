import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: Date) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      bookmarks: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          createdAt: true,
          quiz: { select: { id: true, title: true } },
          blog: { select: { id: true, title: true } },
          artwork: { select: { id: true, title: true } },
        },
      },
      quizAttempts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          score: true,
          totalMarks: true,
          percentage: true,
          correct: true,
          wrong: true,
          skipped: true,
          createdAt: true,
          quiz: { select: { id: true, title: true } },
        },
      },
    },
  })

  const totalBookmarks = users.reduce((total, user) => total + user.bookmarks.length, 0)
  const totalAttempts = users.reduce((total, user) => total + user.quizAttempts.length, 0)

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Users</h1>
        <p className="mt-1 text-sm text-gray-500">Account details and activity across the site.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Registered users" value={users.length} />
        <Stat label="Saved items" value={totalBookmarks} />
        <Stat label="Quiz attempts" value={totalAttempts} />
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center text-sm text-gray-500">No registered users yet.</div>
      ) : (
        <div className="space-y-5">
          {users.map(user => (
            <article key={user.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-4">
                  {user.image ? (
                    <img src={user.image} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-700" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold text-white">
                      {(user.email || user.phone || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-semibold text-gray-100">{user.email || 'Phone account'}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                      {user.email && <a href={`mailto:${user.email}`} className="hover:text-violet-300">{user.email}</a>}
                      {user.phone && <a href={`tel:${user.phone}`} className="hover:text-violet-300">{user.phone}</a>}
                    </div>
                    <p className="mt-2 text-xs text-gray-600">Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[390px]">
                  <MiniStat label="Saved" value={user.bookmarks.length} />
                  <MiniStat label="Attempts" value={user.quizAttempts.length} />
                  <MiniStat label="Passed" value={user.quizAttempts.filter(attempt => attempt.percentage >= 60).length} />
                  <MiniStat label="Latest" value={user.quizAttempts[0] ? `${Math.round(user.quizAttempts[0].percentage)}%` : '—'} />
                </div>
              </div>

              <div className="mt-6 grid gap-5 border-t border-gray-800 pt-5 lg:grid-cols-2">
                <ActivitySection title="Bookmarks">
                  {user.bookmarks.length === 0 ? <Empty text="No saved items." /> : user.bookmarks.map(bookmark => {
                    const item = bookmark.quiz || bookmark.blog || bookmark.artwork
                    return <div key={bookmark.id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-950/70 px-3 py-2.5"><div><p className="text-sm text-gray-300">{item?.title || 'Removed item'}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-violet-400">{bookmark.type}</p></div><time className="flex-none text-xs text-gray-600">{formatDate(bookmark.createdAt)}</time></div>
                  })}
                </ActivitySection>

                <ActivitySection title="Completed quizzes">
                  {user.quizAttempts.length === 0 ? <Empty text="No completed quizzes." /> : user.quizAttempts.map(attempt => <div key={attempt.id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-950/70 px-3 py-2.5"><div><p className="text-sm text-gray-300">{attempt.quiz.title}</p><p className="mt-1 text-xs text-gray-500">{attempt.correct} correct · {attempt.wrong} wrong · {attempt.skipped} skipped</p></div><div className="flex-none text-right"><p className="text-sm font-semibold text-violet-300">{Math.round(attempt.percentage)}%</p><time className="text-xs text-gray-600">{formatDate(attempt.createdAt)}</time></div></div>)}
                </ActivitySection>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-100">{value}</p></div>
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-semibold text-gray-200">{value}</p></div>
}

function ActivitySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-3 text-sm font-semibold text-gray-300">{title}</h3><div className="space-y-2">{children}</div></section>
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-gray-800 px-3 py-5 text-sm text-gray-600">{text}</p>
}
