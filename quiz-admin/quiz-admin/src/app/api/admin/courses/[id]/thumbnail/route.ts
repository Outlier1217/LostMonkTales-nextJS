import { randomUUID } from 'node:crypto'
import { unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assertCourseStorageCapacity, prepareCourseStorage } from '@/lib/course-storage'

const imageTypes: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let filePath: string | null = null
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || !imageTypes[file.type] || file.size === 0) return NextResponse.json({ error: 'Choose a JPG, PNG, or WebP image.' }, { status: 400 })
    const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    const root = await prepareCourseStorage()
    await assertCourseStorageCapacity(root, file.size)
    const storageKey = `thumbnails/${randomUUID()}.${imageTypes[file.type]}`
    filePath = path.join(root, storageKey)
    await import('node:fs/promises').then(({ mkdir }) => mkdir(`${root}/thumbnails`, { recursive: true, mode: 0o750 }))
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: 'wx', mode: 0o640 })
    const thumbnailUrl = `/api/course-thumbnails/${storageKey}`
    await prisma.course.update({ where: { id: params.id }, data: { thumbnailUrl } })
    return NextResponse.json({ thumbnailUrl })
  } catch (error) {
    if (filePath) await unlink(filePath).catch(() => undefined)
    console.error('Course thumbnail upload failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save the course thumbnail.' }, { status: 500 })
  }
}
