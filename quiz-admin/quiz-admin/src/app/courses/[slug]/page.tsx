import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { courseInclude, currentUserId, hasCourseAccess, youtubeEmbedUrl } from '@/lib/courses'
import CourseAccessButton from '@/components/courses/CourseAccessButton'

export const dynamic = 'force-dynamic'

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({ where: { slug: params.slug }, include: courseInclude })
  if (!course || course.status !== 'PUBLISHED') notFound()
  const access = await hasCourseAccess(course.id, await currentUserId())

  return (
    <main className="lm-page section-shell py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#ca6706]">{course.category || 'Course'} · {course.difficulty}</p>
        <h1 className="mt-3 font-serif text-5xl text-[#171310]">{course.title}</h1>
        <p className="mt-5 text-lg text-[#685e55]">{course.description || course.shortDescription}</p>
        <div className="mt-6 rounded-xl bg-[#eadcc3] p-4 text-sm">
          {course.accessType === 'FREE' ? 'This course is free.' : access ? 'You have access to this course.' : `Paid course · ${course.currency} ${course.price ?? ''}. Payment is verified manually before access is granted.`}
          <CourseAccessButton courseId={course.id} paid={course.accessType === 'PAID'} hasAccess={access} />
        </div>
      </div>
      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-3xl text-[#171310]">Curriculum</h2>
        <div className="mt-5 space-y-5">
          {course.sections.map(section => (
            <div key={section.id} className="rounded-2xl border border-[#e5dbc5] p-5">
              <h3 className="font-serif text-2xl">{section.title}</h3>
              <div className="mt-4 space-y-3">
                {section.lessons.filter(lesson => course.accessType === 'FREE' || lesson.isPublished).map(lesson => {
                  const unlocked = access || lesson.isPreview
                  const embed = unlocked ? youtubeEmbedUrl(lesson.youtubeUrl) : null
                  return <article key={lesson.id} className="border-t border-[#eadcc3] pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <span className="text-xs text-[#685e55]">{unlocked ? lesson.type : 'Locked'}</span>
                    </div>
                    {lesson.summary && (unlocked || lesson.isPreview) && <p className="mt-1 text-sm text-[#685e55]">{lesson.summary}</p>}
                    {embed && <div className="mt-3 aspect-video overflow-hidden rounded-xl"><iframe title={lesson.title} src={embed} className="h-full w-full" allowFullScreen /></div>}
                    {unlocked && lesson.type === 'TEXT' && lesson.content && <p className="mt-3 whitespace-pre-wrap text-sm text-[#403831]">{lesson.content}</p>}
                    {unlocked && lesson.resources.length > 0 && <ul className="mt-3 space-y-1 text-sm">{lesson.resources.map(resource => <li key={resource.id}><a className="text-[#ca6706] underline" href={`/api/course-resources/${resource.id}`}>{resource.originalName}</a></li>)}</ul>}
                    {!unlocked && <p className="mt-1 text-sm text-[#685e55]">Preview this lesson by enrolling in the course.</p>}
                  </article>
                })}
              </div>
            </div>
          ))}
        </div>
        {access && course.resources.length > 0 && <div className="mt-8 rounded-2xl border border-[#e5dbc5] p-5">
          <h3 className="font-serif text-2xl text-[#171310]">Course files</h3>
          <ul className="mt-4 space-y-2 text-sm">{course.resources.map(resource => <li key={resource.id}><a className="text-[#ca6706] underline" href={`/api/course-resources/${resource.id}`}>{resource.originalName}</a></li>)}</ul>
        </div>}
      </section>
    </main>
  )
}
