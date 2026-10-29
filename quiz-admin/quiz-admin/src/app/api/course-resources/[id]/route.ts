import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { currentUserId, hasCourseAccess } from '@/lib/courses'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const resource = await prisma.courseResource.findUnique({ where: { id: params.id }, include: { course: { select: { status: true, accessType: true } }, lesson: { select: { isPublished: true } } } })
  if (!resource || resource.course.status !== 'PUBLISHED' || (resource.lesson && !resource.lesson.isPublished && resource.course.accessType !== 'FREE')) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (resource.access !== 'PUBLIC' && !(await hasCourseAccess(resource.courseId, await currentUserId()))) return NextResponse.json({ error: 'Course access required' }, { status: 403 })
  try {
    const root = path.resolve(process.env.COURSE_FILE_STORAGE_DIR || '')
    if (!process.env.COURSE_FILE_STORAGE_DIR) return NextResponse.json({ error: 'Course storage is not configured' }, { status: 503 })
    const requested = path.resolve(root, resource.storageKey)
    if (!requested.startsWith(`${root}${path.sep}`)) return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    const data = await readFile(requested)
    const preview = new URL(request.url).searchParams.get('preview') === '1'
    if (preview && ['docx', 'pptx'].includes(resource.extension)) {
      try {
        const { OfficeParser } = await import('officeparser')
        const ast = await OfficeParser.parseOffice(data)
        const text = String((await ast.to('text')).value || '')
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return new NextResponse(`<!doctype html><meta charset="utf-8"><style>body{font:16px/1.6 system-ui,sans-serif;padding:24px;color:#403831;white-space:pre-wrap}<\/style><body>${escaped || 'This document does not contain extractable text.'}</body>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } })
      } catch (error) {
        console.error('Office document preview failed', error)
        return NextResponse.json({ error: 'Unable to preview this document.' }, { status: 422 })
      }
    }
    return new NextResponse(data, { headers: { 'Content-Type': resource.mimeType, 'Content-Disposition': `${preview ? 'inline' : 'attachment'}; filename="${resource.originalName.replace(/"/g, '')}"`, 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
  }
}
