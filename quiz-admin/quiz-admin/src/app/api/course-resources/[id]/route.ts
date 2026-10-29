import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { currentUserId, hasCourseAccess } from '@/lib/courses'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const resource = await prisma.courseResource.findUnique({ where: { id: params.id }, include: { course: { select: { status: true } }, lesson: { select: { isPublished: true } } } })
  if (!resource || resource.course.status !== 'PUBLISHED' || (resource.lesson && !resource.lesson.isPublished)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (resource.access !== 'PUBLIC' && !(await hasCourseAccess(resource.courseId, await currentUserId()))) return NextResponse.json({ error: 'Course access required' }, { status: 403 })
  try {
    const root = path.resolve(process.env.COURSE_FILE_STORAGE_DIR || '')
    if (!process.env.COURSE_FILE_STORAGE_DIR) return NextResponse.json({ error: 'Course storage is not configured' }, { status: 503 })
    const requested = path.resolve(root, resource.storageKey)
    if (!requested.startsWith(`${root}${path.sep}`)) return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    const data = await readFile(requested)
    return new NextResponse(data, { headers: { 'Content-Type': resource.mimeType, 'Content-Disposition': `attachment; filename="${resource.originalName.replace(/"/g, '')}"`, 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
  }
}
