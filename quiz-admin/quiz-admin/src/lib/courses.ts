import { CourseAccessType, CourseStatus, Prisma } from '@prisma/client'
import { getUserSession } from './auth'
import { prisma } from './db'

export const courseInclude = {
  sections: {
    orderBy: { order: 'asc' as const },
    include: {
      lessons: {
        orderBy: { order: 'asc' as const },
        include: { resources: true },
      },
    },
  },
  resources: { where: { lessonId: null } },
} satisfies Prisma.CourseInclude

export function youtubeEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname)) return null
    const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/\/embed\/([^/]+)/)?.[1]
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
}

export async function currentUserId() {
  const session = await getUserSession()
  return typeof session?.userId === 'string' ? session.userId : null
}

export async function hasCourseAccess(courseId: string, userId: string | null) {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { accessType: true } })
  if (!course) return false
  if (course.accessType === CourseAccessType.FREE) return true
  if (!userId) return false
  const now = new Date()
  const [enrollment, grant] = await Promise.all([
    prisma.courseEnrollment.findFirst({ where: { courseId, userId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    prisma.courseAccessGrant.findFirst({ where: { courseId, userId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
  ])
  return Boolean(enrollment || grant)
}

export function publishedCourseWhere() {
  return { status: CourseStatus.PUBLISHED }
}
