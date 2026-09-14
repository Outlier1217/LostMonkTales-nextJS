import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Contact Messages</h1>
        <p className="mt-1 text-sm text-gray-500">{messages.length} messages received</p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center text-sm text-gray-500">No contact messages yet.</div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <article key={message.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-medium text-gray-100">{message.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-400">
                    <a href={`mailto:${message.email}`} className="hover:text-violet-300">{message.email}</a>
                    {message.phone && <a href={`tel:${message.phone}`} className="hover:text-violet-300">{message.phone}</a>}
                  </div>
                </div>
                <time className="text-xs text-gray-500">{formatDate(message.createdAt)}</time>
              </div>
              <p className="mt-4 whitespace-pre-wrap border-t border-gray-800 pt-4 text-sm leading-7 text-gray-300">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
