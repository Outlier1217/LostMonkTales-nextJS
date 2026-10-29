import CourseStudio from '@/components/courses/CourseStudio'

export default function EditCoursePage({ params }: { params: { id: string } }) { return <CourseStudio id={params.id} /> }
