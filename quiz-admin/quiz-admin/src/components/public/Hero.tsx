export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 md:px-16 py-20 md:py-28">
      <svg
        className="absolute right-[-120px] top-1/2 -translate-y-1/2 opacity-90 animate-[spin_60s_linear_infinite]"
        width="520" height="520" viewBox="0 0 520 520" fill="none"
        aria-hidden="true"
      >
        {[70, 110, 150, 190, 230].map((r, i) => (
          <path
            key={r}
            d={`M 260 ${260 - r} A ${r} ${r} 0 1 1 260 ${260 + r}`}
            stroke="var(--lm-ink)"
            strokeWidth={i === 0 ? 8 : 14}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>

      <p className="lm-mono text-[var(--lm-orange-dark)] mb-4">Architecture · Art · Literature</p>
      <h1 className="lm-display text-5xl md:text-7xl font-medium max-w-xl leading-[1.05]">
        Studio LM
      </h1>
      <p className="mt-5 max-w-md text-[var(--lm-stone)] text-lg">
        Stories, quizzes, artwork and spaces — everything published, in one place.
      </p>
    </section>
  )
}