import Link from 'next/link'

type Item = {
  id: string
  href: string
  title: string
  meta?: string
  tag?: string
  image?: string
}

const viewAllHref: Record<string, string> = {
  Quizzes: '/quizzes',
  'Art Store': '/store',
  'Art & Portraits': '/art-portraits',
  'Architecture Projects': '/architecture',
}

export default function ContentSection({
  eyebrow, title, items,
}: { eyebrow: string; title: string; items: Item[] }) {
  if (items.length === 0) return null

  return (
    <section className="section-shell py-16 md:py-20 lm-divider">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="lm-mono mb-2 text-[0.64rem] text-[#ca6706]">{eyebrow}</p>
          <h2 className="lm-display text-3xl text-[#171310] md:text-4xl">{title}</h2>
        </div>

        {viewAllHref[title] && (
          <Link href={viewAllHref[title]} className="hidden text-sm font-medium text-[#171310] underline-offset-4 hover:underline md:inline-flex">
            View all
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(item => (
          <Link key={item.id} href={item.href} className="group block overflow-hidden rounded-[1.6rem] border border-[#eddcc4] bg-white/80 shadow-[0_18px_50px_rgba(23,19,16,0.04)] transition hover:-translate-y-1 hover:border-[#f2801c]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f9e9d2]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,_rgba(242,128,28,0.22),_rgba(242,128,28,0.06)_45%,_rgba(23,19,16,0.04)_100%)] text-sm font-medium uppercase tracking-[0.16em] text-[#5f564f]">
                  Lost Monk Tales
                </div>
              )}
              {item.tag && (
                <span className="absolute left-4 top-4 rounded-full bg-[#171310]/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#f7f2eb] backdrop-blur-sm">
                  {item.tag}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="lm-display text-2xl leading-tight text-[#171310] transition group-hover:text-[#ca6706]">
                {item.title}
              </h3>
              {item.meta && <p className="mt-2 text-sm text-[#5f564f]">{item.meta}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}