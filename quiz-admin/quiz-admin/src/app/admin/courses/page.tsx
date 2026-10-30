import Link from 'next/link'
import { prisma } from '@/lib/db'
import DeleteCourseButton from '@/components/courses/DeleteCourseButton'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({ orderBy: { updatedAt: 'desc' }, include: { _count: { select: { sections: true, enrollments: true } } } })
  return <div>
    <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Content management</p><h1 className="text-2xl font-bold text-white">Courses</h1></div><Link href="/admin/courses/new" className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">New course</Link></div>
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-800"><table className="w-full text-left text-sm"><thead className="bg-gray-900 text-gray-400"><tr><th className="p-4">Course</th><th>Status</th><th>Sections</th><th>Enrolled</th><th /></tr></thead><tbody>{courses.map(course => <tr key={course.id} className="border-t border-gray-800 text-gray-300"><td className="p-4"><div className="font-medium text-white">{course.title}</div><div className="text-xs text-gray-500">{course.slug}</div></td>        <td><span className="mr-3">{course.status}</span>{course.isFeatured && <span className="text-amber-300">· Featured</span>}</td><td>{course._count.sections}</td><td>{course._count.enrollments}</td><td><Link className="text-violet-400 hover:text-violet-300" href={`/admin/courses/${course.id}`}>Edit</Link><DeleteCourseButton courseId={course.id} /></td></tr>)}</tbody></table></div>
  </div>
}
