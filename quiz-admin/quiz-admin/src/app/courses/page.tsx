import Link from 'next/link'
import { prisma } from '@/lib/db'
import { publishedCourseWhere } from '@/lib/courses'

export const dynamic = 'force-dynamic'

export default async function CoursesPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const q = searchParams.q?.trim()
  const category = searchParams.category?.trim()
  const courses = await prisma.course.findMany({
    where: {
      ...publishedCourseWhere(),
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { shortDescription: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
  })
  const categories = await prisma.course.findMany({ where: publishedCourseWhere(), select: { category: true }, distinct: ['category'] })

  return (
    <main className="lm-page section-shell py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#ca6706]">Learn</p>
      <h1 className="mt-3 font-serif text-5xl text-[#171310]">Courses</h1>
      <p className="mt-4 max-w-2xl text-[#685e55]">Thoughtful lessons, practical resources, and a clear path through every subject.</p>
      <form className="mt-8 flex flex-wrap gap-3" action="/courses">
        <input name="q" defaultValue={q} placeholder="Search courses" className="rounded-full border border-[#d7c3a1] bg-transparent px-4 py-3" />
        <select name="category" defaultValue={category || ''} className="rounded-full border border-[#d7c3a1] bg-transparent px-4 py-3">
          <option value="">All categories</option>
          {categories.map(item => item.category && <option key={item.category} value={item.category}>{item.category}</option>)}
        </select>
        <button className="rounded-full bg-[#171310] px-5 py-3 text-sm text-white">Filter</button>
      </form>
      {courses.length ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="overflow-hidden rounded-2xl border border-[#e5dbc5] bg-white/40 transition hover:-translate-y-1">
              {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" className="h-48 w-full object-cover" /> : <div className="h-48 bg-[#eadcc3]" />}
              <div className="p-5">
                <div className="flex justify-between gap-3 text-xs uppercase tracking-wider text-[#ca6706]">
                  <span>{course.category || 'Course'}</span><span>{course.accessType === 'FREE' ? 'Free' : `${course.currency} ${course.price ?? ''}`}</span>
                </div>
                <h2 className="mt-3 font-serif text-2xl text-[#171310]">{course.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-[#685e55]">{course.shortDescription || course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : <p className="mt-12 text-[#685e55]">No published courses match your search.</p>}
    </main>
  )
}
