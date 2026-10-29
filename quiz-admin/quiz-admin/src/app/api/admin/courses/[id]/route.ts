import { NextResponse } from 'next/server'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { youtubeEmbedUrl } from '@/lib/courses'
import { courseStorageRoot } from '@/lib/course-storage'

async function ensureAdmin() { return Boolean((await getSession())?.username) }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const course = await prisma.course.findUnique({ where: { id: params.id }, include: { sections: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' }, include: { resources: true } } } }, resources: { where: { lessonId: null } } } })
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
        if (!String(item.title || '').trim()) throw new Error('Each lesson needs a title.')
        if (item.type === 'YOUTUBE' && !youtubeEmbedUrl(typeof item.youtubeUrl === 'string' ? item.youtubeUrl : null)) throw new Error('Every YouTube lesson needs a valid YouTube URL.')
      }
    }
    const course = await prisma.$transaction(async tx => {
      const accessType = body.accessType === 'PAID' ? 'PAID' : 'FREE'
      const price = accessType === 'PAID' ? Number(body.price) : null
      if (accessType === 'PAID' && (price === null || !Number.isFinite(price) || price < 0)) throw new Error('Paid courses require a valid price.')
        const updated = await tx.course.update({ where: { id: params.id }, data: {
          title,
          slug: typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : undefined,
          shortDescription: String(body.shortDescription || '').trim() || null,
          description: String(body.description || '').trim() || null,
          thumbnailUrl: String(body.thumbnailUrl || '').trim() || null,
          category: String(body.category || '').trim() || null,
          subject: String(body.subject || '').trim() || null,
          difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(String(body.difficulty)) ? body.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : 'MEDIUM',
          instructor: String(body.instructor || '').trim() || null,
          learningOutcomes: Array.isArray(body.learningOutcomes) ? body.learningOutcomes.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : undefined,
          prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : undefined,
          language: String(body.language || 'English').trim() || 'English',
          durationMinutes: body.durationMinutes === '' || body.durationMinutes == null ? null : Number(body.durationMinutes),
          status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          isFeatured: body.isFeatured === true,
          featuredOrder: Number(body.featuredOrder) || 0,
          accessType,
          price,
          currency: String(body.currency || 'INR').trim().toUpperCase(),
          seoTitle: String(body.seoTitle || '').trim() || null,
          seoDescription: String(body.seoDescription || '').trim() || null,
        } })
        const existingSections = await tx.courseSection.findMany({ where: { courseId: params.id }, include: { lessons: true } })
        const incomingSectionIds = sections.map(section => section && typeof section === 'object' ? String((section as Record<string, unknown>).id || '') : '').filter(Boolean)
        const removedSections = existingSections.filter(section => !incomingSectionIds.includes(section.id))
        if (removedSections.length) {
          await tx.courseResource.updateMany({ where: { courseId: params.id, lessonId: { in: removedSections.flatMap(section => section.lessons.map(lesson => lesson.id)) } }, data: { lessonId: null } })
          await tx.courseSection.deleteMany({ where: { id: { in: removedSections.map(section => section.id) } } })
        }
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const rawSection = sections[sectionIndex]
          const section = rawSection as Record<string, unknown>
          const existingSection = existingSections.find(item => item.id === section.id)
          const savedSection = existingSection
            ? await tx.courseSection.update({ where: { id: existingSection.id }, data: { order: -(sectionIndex + 1) } })
            : await tx.courseSection.create({ data: { courseId: params.id, title: String(section.title).trim(), order: -(sectionIndex + 1) } })
          const lessons = Array.isArray(section.lessons) ? section.lessons : []
          const existingLessons = existingSection?.lessons || []
          const incomingLessonIds = lessons.map(lesson => lesson && typeof lesson === 'object' ? String((lesson as Record<string, unknown>).id || '') : '').filter(Boolean)
          const removedLessons = existingLessons.filter(lesson => !incomingLessonIds.includes(lesson.id))
          if (removedLessons.length) {
            await tx.courseResource.updateMany({ where: { lessonId: { in: removedLessons.map(lesson => lesson.id) } }, data: { lessonId: null } })
            await tx.courseLesson.deleteMany({ where: { id: { in: removedLessons.map(lesson => lesson.id) } } })
          }
          for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
            const lesson = lessons[lessonIndex] as Record<string, unknown>
            const lessonId = String(lesson.id || '')
            const existingLesson = existingLessons.find(item => item.id === lessonId)
            const data = { title: String(lesson.title || '').trim(), slug: String(lesson.slug || lesson.title || `lesson-${lessonIndex + 1}`).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), summary: String(lesson.summary || '').trim() || null, content: String(lesson.content || '').trim() || null, type: ['TEXT', 'YOUTUBE', 'RESOURCE'].includes(String(lesson.type)) ? lesson.type as 'TEXT' | 'YOUTUBE' | 'RESOURCE' : 'TEXT', youtubeUrl: String(lesson.youtubeUrl || '').trim() || null, isPreview: lesson.isPreview === true, isPublished: lesson.isPublished !== false, durationMinutes: lesson.durationMinutes === '' || lesson.durationMinutes == null ? null : Number(lesson.durationMinutes), order: -(lessonIndex + 1) }
            const savedLesson = existingLesson
              ? await tx.courseLesson.update({ where: { id: existingLesson.id }, data })
              : await tx.courseLesson.create({ data: { ...data, sectionId: savedSection.id } })
            await tx.courseLesson.update({ where: { id: savedLesson.id }, data: { order: lessonIndex } })
          }
          await tx.courseSection.update({ where: { id: savedSection.id }, data: { title: String(section.title).trim(), order: sectionIndex } })
        }
      return updated
    })
    return NextResponse.json(course)
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    return NextResponse.json({ error: code === 'P2002' ? 'That course slug is already in use.' : error instanceof Error ? error.message : 'Unable to update course' }, { status: code === 'P2002' ? 409 : 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const course = await prisma.course.findUnique({ where: { id: params.id }, select: { thumbnailUrl: true, resources: { select: { storageKey: true } } } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    await prisma.course.delete({ where: { id: params.id } })
    try {
      const root = courseStorageRoot()
      const keys = course.resources.map(resource => resource.storageKey)
      if (course.thumbnailUrl?.startsWith('/api/course-thumbnails/')) keys.push(course.thumbnailUrl.slice('/api/course-thumbnails/'.length))
      await Promise.all(keys.map(async key => {
        const filePath = path.resolve(root, key)
        if (filePath.startsWith(`${root}${path.sep}`)) await unlink(filePath).catch(error => console.error('Course file cleanup failed', error))
      }))
    } catch (error) {
      console.error('Course file cleanup failed', error)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    return NextResponse.json({ error: code === 'P2025' ? 'Course not found' : 'Unable to delete course.' }, { status: code === 'P2025' ? 404 : 500 })
  }
}
