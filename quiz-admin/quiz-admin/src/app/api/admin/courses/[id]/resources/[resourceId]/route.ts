import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { courseStorageRoot } from '@/lib/course-storage'

export const runtime = 'nodejs'

export async function DELETE(_: Request, { params }: { params: { id: string; resourceId: string } }) {
  if (!(await getSession())?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const resource = await prisma.courseResource.findFirst({ where: { id: params.resourceId, courseId: params.id } })
  if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  await prisma.courseResource.delete({ where: { id: resource.id } })
  try {
    const root = courseStorageRoot()
    const filePath = path.resolve(root, resource.storageKey)
    if (filePath.startsWith(`${root}${path.sep}`)) await unlink(filePath)
  } catch (error) {
    console.error('Course resource file cleanup failed', error)
  }
  return NextResponse.json({ ok: true })
}
