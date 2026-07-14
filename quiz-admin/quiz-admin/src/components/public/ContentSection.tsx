import Link from 'next/link'

type Item = {
  id: string
  href: string
  title: string
  meta?: string
  tag?: string
  image?: string
}

export default function ContentSection({
  eyebrow, title, items,
}: { eyebrow: string; title: string; items: Item[] }) {
  if (items.length === 0) return null

  return (
    <section className="px-6 md:px-16 py-14 lm-divider">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="lm-mono text-[var(--lm-orange-dark)] mb-2">{eyebrow}</p>
          <h2 className="lm-display text-2xl md:text-3xl font-medium">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(item => (
          <Link key={item.id} href={item.href} className="group">
            <div className="relative aspect-[4/5] mb-3 overflow-hidden bg-[var(--lm-orange-tint)] rounded-sm">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="absolute inset-0 rounded-full border-2 border-[var(--lm-orange)] scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-40 transition-all duration-500 m-auto w-8 h-8 pointer-events-none" />
            </div>
            {item.tag && (
              <span className="lm-mono text-[var(--lm-orange-dark)] block mb-1">{item.tag}</span>
            )}
            <h3 className="font-medium leading-snug group-hover:text-[var(--lm-orange)] transition-colors">
              {item.title}
            </h3>
            {item.meta && <p className="text-sm text-[var(--lm-stone)] mt-0.5">{item.meta}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}