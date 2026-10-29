import { unlink, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assertCourseStorageCapacity, courseFileTypes, courseMaxFileSize, prepareCourseStorage } from '@/lib/course-storage'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || !courseFileTypes[file.type] || file.size > courseMaxFileSize()) return NextResponse.json({ error: 'Unsupported file or file exceeds the configured upload limit.' }, { status: 400 })
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  const root = await prepareCourseStorage()
  await assertCourseStorageCapacity(root, file.size)
  const storageKey = `${randomUUID()}.${courseFileTypes[file.type]}`
  const storedPath = `${root}/${storageKey}`
  await writeFile(storedPath, Buffer.from(await file.arrayBuffer()), { flag: 'wx', mode: 0o640 })
  try {
    const session = await getSession()
    const uploadedBy = typeof session?.username === 'string' ? session.username : 'admin'
    const resource = await prisma.courseResource.create({ data: { courseId: params.id, lessonId: typeof form.get('lessonId') === 'string' ? String(form.get('lessonId')) || null : null, originalName: file.name.replace(/[^\w.\- ]/g, '_'), storageKey, mimeType: file.type, extension: courseFileTypes[file.type], size: file.size, access: form.get('access') === 'PUBLIC' ? 'PUBLIC' : 'ENROLLED', uploadedBy } })
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    await unlink(storedPath).catch(() => undefined)
    console.error('Course resource metadata creation failed', error)
    return NextResponse.json({ error: 'Unable to save course resource metadata.' }, { status: 500 })
  }
}
