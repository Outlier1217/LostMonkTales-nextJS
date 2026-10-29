import { prisma } from './db'

export async function getFeaturedCourses() {
  try {
    return await prisma.course.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
      console.error('Courses migration is not applied; featured courses are temporarily unavailable.')
      return []
    }
    throw error
  }
}
