import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { courseStorageRoot } from '@/lib/course-storage'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.join('/')
  const course = await prisma.course.findFirst({ where: { thumbnailUrl: `/api/course-thumbnails/${key}` }, select: { status: true } })
  const isAdmin = Boolean((await getSession())?.username)
  if (!course || (course.status !== 'PUBLISHED' && !isAdmin)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const root = courseStorageRoot()
    const filePath = path.resolve(root, key)
    if (!filePath.startsWith(`${root}${path.sep}`)) return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    const data = await readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()
    const contentType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg'
    return new NextResponse(data, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' } })
  } catch {
    return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
  }
}
