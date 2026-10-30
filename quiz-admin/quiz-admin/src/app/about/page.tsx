import Image from 'next/image'
import { getAboutPage, defaultAbout } from '@/lib/about'
import type { AboutPerson } from '@prisma/client'

export const dynamic = 'force-dynamic'

function paragraphs(value: string) {
  return value.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)
}

export default async function AboutPage() {
  const about = await getAboutPage()
  const content = about || { ...defaultAbout, people: [] }
  const team = content.people.filter((person: AboutPerson) => person.kind === 'TEAM')

  return (
    <main className="lm-page">
      <section className="section-shell py-14 md:py-24">
        <p className="lm-mono mb-4 text-[#ca6706]">The story behind the studio</p>
        <h1 className="lm-display max-w-4xl text-6xl leading-[0.92] text-[#171310] md:text-8xl">{content.title}</h1>
        <p className="lm-display mt-7 max-w-2xl text-2xl text-[#ca6706] md:text-4xl">{content.tagline}</p>
      </section>

      <section className="section-shell grid gap-12 pb-20 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
        <div className="lm-mono text-[#ca6706]">01 / Our beginning</div>
        <div className="about-copy text-lg leading-8 text-[#5f564f]">{paragraphs(content.introduction)}</div>
      </section>

      {[
        ['02 / What we do', 'What We Do', content.whatWeDo],
        ['03 / Learning', 'Quizzes, Courses & Exam Preparation', content.quizzesCourses],
        ['04 / Studio LM', 'Beyond Religion — The Studio LM Vision', content.studioVision],
        ['05 / Our philosophy', 'Our Philosophy', content.philosophy],
      ].map(([eyebrow, title, text]) => (
        <section key={title} className="section-shell border-t border-[#d9cdb9] py-16 md:py-20">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
            <p className="lm-mono text-[#ca6706]">{eyebrow}</p>
            <div>
              <h2 className="lm-display mb-6 text-4xl leading-tight text-[#171310] md:text-6xl">{title}</h2>
              <div className="about-copy text-lg leading-8 text-[#5f564f]">{paragraphs(text)}</div>
            </div>
          </div>
        </section>
      ))}

      <section className="section-shell py-16">
        <div className="rounded-[2rem] bg-[#171310] px-7 py-12 text-center text-[#f7f2eb] md:px-20 md:py-20">
          <div className="about-copy mx-auto max-w-3xl text-xl leading-9 text-[#d7cbc2]">{paragraphs(content.closing)}</div>
        </div>
      </section>

      <section className="section-shell border-t border-[#d9cdb9] py-20">
        <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="lm-mono text-[#ca6706]">06 / The founder</p>
          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-start">
            {content.founderImage ? (
              <Image src={content.founderImage} alt={content.founderName} width={440} height={520} className="aspect-[4/5] rounded-[1.5rem] object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-end rounded-[1.5rem] bg-[#eadcc3] p-5 text-sm text-[#5f564f]">Founder portrait</div>
            )}
            <div>
              <h2 className="lm-display text-4xl text-[#171310] md:text-5xl">{content.founderName}</h2>
              <p className="lm-mono mt-3 text-[#ca6706]">{content.founderDesignation}</p>
              <div className="about-copy mt-7 text-lg leading-8 text-[#5f564f]">{paragraphs(content.founderBio)}</div>
            </div>
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="section-shell border-t border-[#d9cdb9] py-20">
          <p className="lm-mono mb-4 text-[#ca6706]">07 / The team</p>
          <h2 className="lm-display mb-10 text-5xl text-[#171310]">People shaping the work</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person: AboutPerson) => (
              <article key={person.id} className="public-card overflow-hidden rounded-[1.5rem]">
                {person.image ? <Image src={person.image} alt={person.name} width={600} height={450} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-[#eadcc3]" />}
                <div className="p-5">
                  <h3 className="lm-display text-2xl text-[#171310]">{person.name}</h3>
                  <p className="lm-mono mt-2 text-[#ca6706]">{person.designation}</p>
                  {person.bio && <p className="mt-4 text-sm leading-6 text-[#5f564f]">{person.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
