import { prisma } from '@/lib/db'
import Hero from '@/components/public/Hero'
import BlogsSection from '@/components/public/BlogsSection'
import ContentSection from '@/components/public/ContentSection'
import { getFeaturedCourses } from '@/lib/featured-courses'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [blogs, quizzes, artworks, portraits, architectureProjects, courses] = await Promise.all([
    prisma.blog.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } }),
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.artwork.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.portrait.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } }),
    prisma.architectureProject.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } }),
    getFeaturedCourses(),
  ])

  return (
    <main className="lm-page">
      <Hero />
      <BlogsSection blogs={blogs} />
      <ContentSection
        eyebrow="Learn"
        title="Featured Courses"
        items={courses.map(course => ({
          id: course.id,
          href: `/courses/${course.slug}`,
          title: course.title,
          meta: course.category || 'Course',
          image: course.thumbnailUrl || undefined,
          tag: course.accessType === 'FREE' ? 'Free' : `${course.currency} ${course.price ?? ''}`,
        }))}
      />

      <ContentSection
        eyebrow="Play"
        title="Quizzes"
        items={quizzes.map(q => ({
          id: q.id,
          href: `/quizzes/${q.id}`,
          title: q.title,
          meta: `${q.category} · ${q._count.questions} questions`,
          tag: q.difficulty,
        }))}
      />

      <ContentSection
        eyebrow="Collect"
        title="Art Store"
        items={artworks.map(a => ({
          id: a.id,
          href: `/store/${a.id}`,
          title: a.title,
          meta: a.category.name,
          image: (a.images as string[])[0],
          tag: `₹${a.price}`,
        }))}
      />

      <ContentSection
        eyebrow="Portraits"
        title="Art & Portraits"
        items={portraits.map(p => ({
          id: p.id,
          href: `/art-portraits/${p.id}`,
          title: p.title,
          meta: p.category.replaceAll('_', ' '),
          image: p.image,
        }))}
      />

      <ContentSection
        eyebrow="Design"
        title="Architecture Projects"
        items={architectureProjects.map(p => ({
          id: p.id,
          href: `/architecture/${p.id}`,
          title: p.title,
          meta: [p.location, p.size].filter(Boolean).join(' · '),
          image: (p.images as string[])[0],
          tag: p.category,
        }))}
      />
    </main>
  )
}