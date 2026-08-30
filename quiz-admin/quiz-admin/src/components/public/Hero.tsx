import Link from 'next/link'
import { ArrowRight, BookOpenText, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="section-shell relative overflow-hidden py-10 md:py-16">
      <div className="public-card relative overflow-hidden rounded-[2.2rem] border border-[#e8dcc6] bg-[#f4efe9] px-6 py-7 md:px-10 md:py-10">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_center,_rgba(242,128,28,0.18),_rgba(242,128,28,0.06)_38%,_transparent_70%)] md:block" />

        <div className="relative z-10 grid gap-10 md:grid-cols-[1.18fr_0.82fr] md:items-center">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[#ca6706]">
              <Sparkles className="h-4 w-4" />
              <span className="lm-mono text-[0.62rem] text-[#ca6706]">Stories · Quizzes · Art · Architecture</span>
            </div>

            <h1 className="lm-display max-w-xl text-5xl leading-[0.9] text-[#171310] md:text-[6.25rem] md:leading-[0.9]">
              Lost Monk Tales
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#5f564f] md:text-[1.12rem]">
              A refined collection of long-form stories, immersive quizzes, artwork, and thoughtful spaces shaped by memory, craft, and curiosity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 rounded-full bg-[#f2801c] px-5 py-3 text-sm font-medium text-[#171310] shadow-[0_14px_30px_rgba(242,128,28,0.28)] transition hover:bg-[#ff9a3d]"
              >
                Read the Journal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-2 rounded-full border border-[#c7b7a5] bg-transparent px-5 py-3 text-sm font-medium text-[#171310] transition hover:border-[#f2801c] hover:text-[#ca6706]"
              >
                <BookOpenText className="h-4 w-4" /> Explore Quizzes
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            <div className="relative h-[280px] w-[280px] md:h-[360px] md:w-[360px]">
              <div className="absolute inset-0 rounded-full bg-[#f2801c] shadow-[0_25px_80px_rgba(242,128,28,0.32)]" />
              <div className="absolute inset-[18%] rounded-full border-[10px] border-[#171310] bg-[#171310]" />
              <div className="absolute inset-[28%] rounded-full border-[10px] border-[#f7f2eb] bg-[#171310]" />
              <div className="absolute bottom-[22%] left-[18%] h-[25%] w-[28%] rounded-full border-[10px] border-[#171310] bg-[#171310]" />
              <div className="absolute right-[15%] top-[20%] h-5 w-5 rounded-full bg-[#f7f2eb] shadow-[0_0_0_8px_rgba(23,19,16,0.9)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}