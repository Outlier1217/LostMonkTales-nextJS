import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { youtubeEmbedUrl } from '@/lib/courses'

async function ensureAdmin() { return Boolean((await getSession())?.username) }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const course = await prisma.course.findUnique({ where: { id: params.id }, include: { sections: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } } } })
  return course ? NextResponse.json(course) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json() as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) throw new Error('Title is required.')
    const sections = Array.isArray(body.sections) ? body.sections : []
    for (const section of sections) {
      if (!section || typeof section !== 'object' || typeof (section as Record<string, unknown>).title !== 'string') throw new Error('Each section needs a title.')
      const lessons = Array.isArray((section as Record<string, unknown>).lessons) ? (section as Record<string, unknown>).lessons as unknown[] : []
      for (const lesson of lessons) {
        const item = lesson as Record<string, unknown>
        if (item.type === 'YOUTUBE' && !youtubeEmbedUrl(typeof item.youtubeUrl === 'string' ? item.youtubeUrl : null)) throw new Error('Every YouTube lesson needs a valid YouTube URL.')
      }
    }
    const course = await prisma.$transaction(async tx => {
      const accessType = body.accessType === 'PAID' ? 'PAID' : 'FREE'
      const price = accessType === 'PAID' ? Number(body.price) : null
      if (accessType === 'PAID' && (price === null || !Number.isFinite(price) || price < 0)) throw new Error('Paid courses require a valid price.')
      const updated = await tx.course.update({ where: { id: params.id }, data: { title, shortDescription: String(body.shortDescription || '').trim() || null, description: String(body.description || '').trim() || null, thumbnailUrl: String(body.thumbnailUrl || '').trim() || null, category: String(body.category || '').trim() || null, subject: String(body.subject || '').trim() || null, status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT', isFeatured: body.isFeatured === true, featuredOrder: Number(body.featuredOrder) || 0, accessType, price, currency: String(body.currency || 'INR').trim().toUpperCase() } })
      await tx.courseSection.deleteMany({ where: { courseId: params.id } })
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const rawSection = sections[sectionIndex]
        const section = rawSection as Record<string, unknown>
        await tx.courseSection.create({ data: { courseId: params.id, title: String(section.title).trim(), order: sectionIndex, lessons: { create: (Array.isArray(section.lessons) ? section.lessons : []).map((rawLesson, lessonIndex) => { const lesson = rawLesson as Record<string, unknown>; return { title: String(lesson.title || '').trim(), slug: String(lesson.slug || lesson.title || `lesson-${lessonIndex + 1}`).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), summary: String(lesson.summary || '').trim() || null, content: String(lesson.content || '').trim() || null, type: ['TEXT', 'YOUTUBE', 'RESOURCE'].includes(String(lesson.type)) ? lesson.type as 'TEXT' | 'YOUTUBE' | 'RESOURCE' : 'TEXT', youtubeUrl: String(lesson.youtubeUrl || '').trim() || null, isPreview: lesson.isPreview === true, isPublished: lesson.isPublished !== false, order: lessonIndex } }) } } })
      }
      return updated
    })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update course' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
