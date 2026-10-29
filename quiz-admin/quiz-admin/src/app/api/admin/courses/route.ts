import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { youtubeEmbedUrl } from '@/lib/courses'

async function admin() {
  const session = await getSession()
  return session?.username ? session : null
}

function courseData(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Title and a valid slug are required.')
  const accessType = body.accessType === 'PAID' ? 'PAID' : 'FREE'
  const price = accessType === 'PAID' ? Number(body.price) : null
  if (accessType === 'PAID' && (price === null || !Number.isFinite(price) || price < 0)) throw new Error('Paid courses require a valid price.')
  return {
    title, slug,
    shortDescription: typeof body.shortDescription === 'string' ? body.shortDescription.trim() : null,
    description: typeof body.description === 'string' ? body.description.trim() : null,
    thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() || null : null,
    category: typeof body.category === 'string' ? body.category.trim() || null : null,
    subject: typeof body.subject === 'string' ? body.subject.trim() || null : null,
    difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(String(body.difficulty)) ? body.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : 'MEDIUM',
    instructor: typeof body.instructor === 'string' ? body.instructor.trim() || null : null,
    learningOutcomes: Array.isArray(body.learningOutcomes) ? body.learningOutcomes.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : undefined,
    prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : undefined,
    language: typeof body.language === 'string' && body.language.trim() ? body.language.trim() : 'English',
    durationMinutes: body.durationMinutes === '' || body.durationMinutes == null ? null : Number(body.durationMinutes),
    accessType: accessType as 'FREE' | 'PAID',
    price,
    currency: typeof body.currency === 'string' && body.currency.trim() ? body.currency.trim().toUpperCase() : 'INR',
    status: (body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT',
    isFeatured: body.isFeatured === true,
    featuredOrder: Number(body.featuredOrder) || 0,
    seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle.trim() || null : null,
    seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription.trim() || null : null,
  }
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await prisma.course.findMany({ orderBy: { updatedAt: 'desc' }, include: { _count: { select: { sections: true, enrollments: true } } } }))
}

export async function POST(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json() as Record<string, unknown>
    const rawSections = Array.isArray(body.sections) ? body.sections : []
    const sections = rawSections.map((rawSection, sectionIndex) => {
      if (!rawSection || typeof rawSection !== 'object') throw new Error('Each section needs a title.')
      const section = rawSection as Record<string, unknown>
      const title = typeof section.title === 'string' ? section.title.trim() : ''
      if (!title) throw new Error('Each section needs a title.')
      const rawLessons = Array.isArray(section.lessons) ? section.lessons : []
      const lessons = rawLessons.map((rawLesson, lessonIndex) => {
        if (!rawLesson || typeof rawLesson !== 'object') throw new Error('Each lesson needs a title.')
        const lesson = rawLesson as Record<string, unknown>
        const lessonTitle = typeof lesson.title === 'string' ? lesson.title.trim() : ''
        if (!lessonTitle) throw new Error('Each lesson needs a title.')
        const type = ['TEXT', 'YOUTUBE', 'RESOURCE'].includes(String(lesson.type)) ? lesson.type as 'TEXT' | 'YOUTUBE' | 'RESOURCE' : 'TEXT'
        const youtubeUrl = typeof lesson.youtubeUrl === 'string' ? lesson.youtubeUrl.trim() || null : null
        if (type === 'YOUTUBE' && !youtubeEmbedUrl(youtubeUrl)) throw new Error('Every YouTube lesson needs a valid YouTube URL.')
        return {
          title: lessonTitle,
          slug: String(lesson.slug || lessonTitle || `lesson-${lessonIndex + 1}`).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `lesson-${lessonIndex + 1}`,
          summary: typeof lesson.summary === 'string' ? lesson.summary.trim() || null : null,
          content: typeof lesson.content === 'string' ? lesson.content.trim() || null : null,
          type,
          youtubeUrl,
          isPreview: lesson.isPreview === true,
          isPublished: lesson.isPublished !== false,
          durationMinutes: lesson.durationMinutes === '' || lesson.durationMinutes == null ? null : Number(lesson.durationMinutes),
          order: lessonIndex,
        }
      })
      return { title, order: sectionIndex, lessons: { create: lessons } }
    })
    const course = await prisma.course.create({ data: { ...courseData(body), sections: { create: sections } } })
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    const message = code === 'P2002' ? 'That course slug is already in use.' : error instanceof Error ? error.message : 'Unable to create course'
    return NextResponse.json({ error: message }, { status: code === 'P2002' ? 409 : 400 })
  }
}
