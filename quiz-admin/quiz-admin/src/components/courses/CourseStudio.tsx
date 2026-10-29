'use client'

import { useEffect, useState } from 'react'

type Lesson = { id?: string; title: string; slug: string; summary?: string; content?: string; type: 'TEXT' | 'YOUTUBE' | 'RESOURCE'; youtubeUrl?: string; durationMinutes?: number | null; isPreview?: boolean; isPublished?: boolean; resources?: Resource[] }
type Section = { id?: string; title: string; lessons: Lesson[] }
type Resource = { id: string; originalName: string; size: number; access: 'PUBLIC' | 'ENROLLED'; lessonId?: string | null }
const starter: Section[] = [{ title: 'Module 1', lessons: [{ title: 'Welcome', slug: 'welcome', type: 'TEXT', isPreview: true, isPublished: true }] }]
const supportedCourseFiles = 'PDF, DOC, DOCX, CSV, XLS, XLSX, TXT, PPT, PPTX, JPG, PNG, WEBP'

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CourseStudio({ id }: { id?: string }) {
  const [form, setForm] = useState({ title: '', slug: '', shortDescription: '', description: '', category: '', subject: '', difficulty: 'MEDIUM', instructor: '', language: 'English', durationMinutes: '', learningOutcomes: '', prerequisites: '', thumbnailUrl: '', status: 'DRAFT', isFeatured: false, featuredOrder: '0', accessType: 'FREE', price: '', currency: 'INR', seoTitle: '', seoDescription: '' })
  const [sections, setSections] = useState<Section[]>(starter)
  const [resources, setResources] = useState<Resource[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingThumbnail, setPendingThumbnail] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [users, setUsers] = useState<{ id: string; email?: string | null; phone?: string | null }[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [orders, setOrders] = useState<{ id: string; status: string; amount: number; currency: string; user: { email?: string | null; phone?: string | null } }[]>([])

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/courses/${id}`).then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load course.')
      setForm(current => ({ ...current, ...data, price: data.price?.toString() || '', durationMinutes: data.durationMinutes?.toString() || '', featuredOrder: data.featuredOrder?.toString() || '0', learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes.join('\n') : '', prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites.join('\n') : '' }))
      setSections(data.sections || [])
      setResources(data.resources || [])
      const accessResponse = await fetch(`/api/admin/courses/${id}/access`)
      if (accessResponse.ok) setOrders((await accessResponse.json()).orders || [])
    }).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to load course.'))
  }, [id])

  const update = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }))
  async function responseData(response: Response): Promise<{ error?: string; [key: string]: unknown }> {
    const text = await response.text()
    if (!text) return { error: `Upload failed (${response.status}).` }
    try {
      return JSON.parse(text) as { error?: string; [key: string]: unknown }
    } catch {
      return { error: `Upload failed (${response.status}). The server returned an invalid response.` }
    }
  }
  const updateSection = (sectionIndex: number, patch: Partial<Section>) => setSections(items => items.map((item, index) => index === sectionIndex ? { ...item, ...patch } : item))
  const updateLesson = (sectionIndex: number, lessonIndex: number, patch: Partial<Lesson>) => setSections(items => items.map((section, si) => si === sectionIndex ? { ...section, lessons: section.lessons.map((lesson, li) => li === lessonIndex ? { ...lesson, ...patch } : lesson) } : section))
  const addSection = () => setSections(items => [...items, { title: `Module ${items.length + 1}`, lessons: [] }])
  const addLesson = (sectionIndex: number) => setSections(items => items.map((section, index) => index === sectionIndex ? { ...section, lessons: [...section.lessons, { title: 'New lesson', slug: 'new-lesson', type: 'TEXT', isPublished: false }] } : section))
  const removeSection = (index: number) => setSections(items => items.filter((_, itemIndex) => itemIndex !== index))
  const removeLesson = (sectionIndex: number, lessonIndex: number) => setSections(items => items.map((section, si) => si === sectionIndex ? { ...section, lessons: section.lessons.filter((_, li) => li !== lessonIndex) } : section))
  const move = (sectionIndex: number, lessonIndex: number, direction: -1 | 1) => setSections(items => items.map((section, si) => {
    if (si !== sectionIndex || !section.lessons[lessonIndex + direction]) return section
    const lessons = [...section.lessons]; [lessons[lessonIndex], lessons[lessonIndex + direction]] = [lessons[lessonIndex + direction], lessons[lessonIndex]]
    return { ...section, lessons }
  }))

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    const payload = { ...form, learningOutcomes: form.learningOutcomes.split('\n').map(value => value.trim()).filter(Boolean), prerequisites: form.prerequisites.split('\n').map(value => value.trim()).filter(Boolean), sections }
    const response = await fetch(id ? `/api/admin/courses/${id}` : '/api/admin/courses', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json()
    if (!response.ok) { setSaving(false); setMessage(data.error || 'Unable to save course.'); return }
    const savedCourseId = id || data.id
    for (const file of pendingFiles) await upload(file, undefined, savedCourseId)
    if (pendingThumbnail) await uploadThumbnail(pendingThumbnail, savedCourseId)
    setPendingFiles([])
    setPendingThumbnail(null)
    setSaving(false); setMessage('Course saved.')
    if (!id) window.location.href = `/admin/courses/${data.id}`
  }

  async function upload(file: File, lessonId?: string, courseId = id) {
    if (!courseId) { setPendingFiles(items => [...items, file]); setMessage(`${file.name} will upload when the course is saved.`); return }
    const body = new FormData(); body.append('file', file); if (lessonId) body.append('lessonId', lessonId)
    let response: Response
    try {
      response = await fetch(`/api/admin/courses/${courseId}/resources`, { method: 'POST', body })
    } catch {
      setMessage('Upload failed: unable to reach the server.')
      return
    }
    const data = await responseData(response)
    if (!response.ok) { setMessage(data.error || 'Upload failed.'); return }
    setResources(items => [...items, data as Resource]); setMessage(`${file.name} uploaded.`)
  }

  async function removeResource(resource: Resource) {
    if (!id || !window.confirm(`Remove ${resource.originalName}?`)) return
    const response = await fetch(`/api/admin/courses/${id}/resources/${resource.id}`, { method: 'DELETE' })
    const data = await responseData(response)
    if (!response.ok) { setMessage(data.error || 'Unable to remove file.'); return }
    setResources(items => items.filter(item => item.id !== resource.id))
    setMessage(`${resource.originalName} removed.`)
  }

  async function deleteCourse() {
    if (!id || !window.confirm('Delete this course and all of its content? This cannot be undone.')) return
    const response = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) { setMessage(data.error || 'Unable to delete course.'); return }
    window.location.href = '/admin/courses'
  }

  async function uploadThumbnail(file: File, courseId = id) {
    if (!courseId) {
      setPendingThumbnail(file)
      setMessage(`${file.name} will upload when the course is saved.`)
      return
    }
    const body = new FormData(); body.append('file', file)
    let response: Response
    try {
      response = await fetch(`/api/admin/courses/${courseId}/thumbnail`, { method: 'POST', body })
    } catch {
      setMessage('Thumbnail upload failed: unable to reach the server.')
      return
    }
    const data = await responseData(response)
    setMessage(response.ok ? 'Thumbnail uploaded.' : data.error || 'Thumbnail upload failed.')
    if (response.ok && typeof data.thumbnailUrl === 'string') update('thumbnailUrl', data.thumbnailUrl)
  }

  async function searchUsers() {
    const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}`)
    if (response.ok) setUsers(await response.json())
  }

  async function grantAccess() {
    if (!id || !selectedUser) return
    const response = await fetch(`/api/admin/courses/${id}/access`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selectedUser }) })
    setMessage(response.ok ? 'Access granted.' : ((await response.json()).error || 'Unable to grant access.'))
  }

  async function verifyOrder(orderId: string) {
    if (!id) return
    const response = await fetch(`/api/admin/courses/${id}/orders/${orderId}/verify`, { method: 'POST' })
    setMessage(response.ok ? 'Order verified and access granted.' : ((await response.json()).error || 'Unable to verify order.'))
    if (response.ok) setOrders(items => items.map(order => order.id === orderId ? { ...order, status: 'VERIFIED' } : order))
  }

  const input = 'mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white'
  return <form onSubmit={save} className="max-w-5xl space-y-6">
    <div><p className="text-sm text-gray-500">Course Studio</p><h1 className="text-2xl font-bold text-white">{id ? 'Edit course' : 'New course'}</h1></div>
    <div className="grid gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 md:grid-cols-2">
      {([['title', 'Title'], ['slug', 'Slug'], ['category', 'Category'], ['subject', 'Subject'], ['instructor', 'Instructor'], ['language', 'Language'], ['thumbnailUrl', 'Thumbnail URL'], ['seoTitle', 'SEO title']] as const).map(([key, label]) => <label key={key} className="text-sm text-gray-300">{label}<input required={key === 'title' || key === 'slug'} value={form[key]} onChange={event => update(key, event.target.value)} onBlur={() => key === 'title' && !id && !form.slug && update('slug', slugify(form.title))} className={input} /></label>)}
      <label className="text-sm text-gray-300">Upload cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadThumbnail(file) }} className={`${input} file:mr-3 file:rounded file:border-0 file:bg-gray-700 file:px-2 file:py-1`} />{pendingThumbnail && <span className="mt-1 block text-xs text-gray-400">Waiting to upload: {pendingThumbnail.name}</span>}</label>
      <label className="text-sm text-gray-300">Difficulty<select value={form.difficulty} onChange={event => update('difficulty', event.target.value)} className={input}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></label>
      <label className="text-sm text-gray-300">Duration (minutes)<input type="number" min="0" value={form.durationMinutes} onChange={event => update('durationMinutes', event.target.value)} className={input} /></label>
      <label className="text-sm text-gray-300">Access<select value={form.accessType} onChange={event => update('accessType', event.target.value)} className={input}><option>FREE</option><option>PAID</option></select></label>
      {form.accessType === 'PAID' && <><label className="text-sm text-gray-300">Price<input required type="number" min="0" step="0.01" value={form.price} onChange={event => update('price', event.target.value)} className={input} /></label><label className="text-sm text-gray-300">Currency<input value={form.currency} onChange={event => update('currency', event.target.value)} className={input} /></label></>}
      <label className="text-sm text-gray-300">Status<select value={form.status} onChange={event => update('status', event.target.value)} className={input}><option>DRAFT</option><option>PUBLISHED</option></select></label>
      <label className="text-sm text-gray-300">Featured order<input type="number" min="0" value={form.featuredOrder} onChange={event => update('featuredOrder', event.target.value)} className={input} /></label>
      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.isFeatured} onChange={event => update('isFeatured', event.target.checked)} /> Featured on homepage</label>
      <label className="text-sm text-gray-300 md:col-span-2">Short description<textarea value={form.shortDescription} onChange={event => update('shortDescription', event.target.value)} className={input} /></label>
      <label className="text-sm text-gray-300 md:col-span-2">Description<textarea rows={5} value={form.description} onChange={event => update('description', event.target.value)} className={input} /></label>
      <label className="text-sm text-gray-300">Learning outcomes (one per line)<textarea value={form.learningOutcomes} onChange={event => update('learningOutcomes', event.target.value)} className={input} /></label>
      <label className="text-sm text-gray-300">Prerequisites (one per line)<textarea value={form.prerequisites} onChange={event => update('prerequisites', event.target.value)} className={input} /></label>
      <label className="text-sm text-gray-300 md:col-span-2">SEO description<textarea value={form.seoDescription} onChange={event => update('seoDescription', event.target.value)} className={input} /></label>
    </div>
    <div className="space-y-4">{sections.map((section, sectionIndex) => <div key={section.id || sectionIndex} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex gap-2"><input value={section.title} onChange={event => updateSection(sectionIndex, { title: event.target.value })} className="flex-1 bg-transparent text-lg font-semibold text-white" /><button type="button" onClick={() => removeSection(sectionIndex)} className="text-sm text-red-400">Delete section</button></div>
      {section.lessons.map((lesson, lessonIndex) => <div key={lesson.id || lessonIndex} className="mt-4 grid gap-2 border-t border-gray-800 pt-4 md:grid-cols-2">
        <input placeholder="Lesson title" value={lesson.title} onChange={event => updateLesson(sectionIndex, lessonIndex, { title: event.target.value, slug: slugify(event.target.value) })} className={input} />
        <input placeholder="Slug" value={lesson.slug} onChange={event => updateLesson(sectionIndex, lessonIndex, { slug: event.target.value })} className={input} />
        <select value={lesson.type} onChange={event => updateLesson(sectionIndex, lessonIndex, { type: event.target.value as Lesson['type'] })} className={input}><option>TEXT</option><option>YOUTUBE</option><option>RESOURCE</option></select>
        <input type="number" min="0" placeholder="Duration (minutes)" value={lesson.durationMinutes ?? ''} onChange={event => updateLesson(sectionIndex, lessonIndex, { durationMinutes: event.target.value ? Number(event.target.value) : null })} className={input} />
        <input placeholder="Summary" value={lesson.summary || ''} onChange={event => updateLesson(sectionIndex, lessonIndex, { summary: event.target.value })} className={`${input} md:col-span-2`} />
        {lesson.type === 'YOUTUBE' && <input placeholder="YouTube URL" value={lesson.youtubeUrl || ''} onChange={event => updateLesson(sectionIndex, lessonIndex, { youtubeUrl: event.target.value })} className={`${input} md:col-span-2`} />}
        <textarea placeholder="Lesson content" value={lesson.content || ''} onChange={event => updateLesson(sectionIndex, lessonIndex, { content: event.target.value })} className={`${input} md:col-span-2`} />
        <label className="flex gap-2 text-sm text-gray-300"><input type="checkbox" checked={lesson.isPreview || false} onChange={event => updateLesson(sectionIndex, lessonIndex, { isPreview: event.target.checked })} /> Preview</label>
        <label className="flex gap-2 text-sm text-gray-300"><input type="checkbox" checked={lesson.isPublished !== false} onChange={event => updateLesson(sectionIndex, lessonIndex, { isPublished: event.target.checked })} /> Published</label>
        <div className="flex flex-wrap gap-3 text-xs"><button type="button" onClick={() => move(sectionIndex, lessonIndex, -1)} className="text-gray-400">Up</button><button type="button" onClick={() => move(sectionIndex, lessonIndex, 1)} className="text-gray-400">Down</button><button type="button" onClick={() => removeLesson(sectionIndex, lessonIndex)} className="text-red-400">Delete lesson</button>{id && lesson.id && <label className="text-violet-400">Attach file<input type="file" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file, lesson.id) }} /></label>}</div>
      </div>)}<button type="button" onClick={() => addLesson(sectionIndex)} className="mt-4 text-sm text-violet-400">+ Add lesson</button>
    </div>)}</div>
    <button type="button" onClick={addSection} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300">+ Add section</button>
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-white">Course resources</h2><p className="mt-1 text-sm text-gray-500">{id ? 'Upload files that belong to the whole course.' : 'Files selected here will upload after you save the course.'}</p><p className="mt-1 text-xs text-gray-500">Allowed file types: {supportedCourseFiles}</p><label className="mt-3 inline-block cursor-pointer rounded border border-gray-700 px-3 py-2 text-sm text-gray-300">Upload course file<input type="file" accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file) }} /></label>{pendingFiles.length > 0 && <ul className="mt-2 space-y-1 text-xs text-gray-400">{pendingFiles.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3"><span>Waiting to upload: {file.name}</span><button type="button" onClick={() => setPendingFiles(items => items.filter((_, itemIndex) => itemIndex !== index))} className="text-red-400">Remove</button></li>)}</ul>}<ul className="mt-3 space-y-1 text-sm text-gray-400">{resources.map(resource => <li key={resource.id} className="flex items-center justify-between gap-3"><span>{resource.originalName} · {resource.access}</span>{id && <button type="button" onClick={() => void removeResource(resource)} className="text-red-400">Remove</button>}</li>)}</ul></div>
    {id && <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-white">Grant user access</h2><div className="mt-3 flex gap-2"><input value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder="Email or phone" className={input} /><button type="button" onClick={() => void searchUsers()} className="rounded border border-gray-700 px-3 text-sm text-gray-300">Search</button></div>{users.length > 0 && <div className="mt-3 flex gap-2"><select value={selectedUser} onChange={event => setSelectedUser(event.target.value)} className={input}><option value="">Select user</option>{users.map(user => <option key={user.id} value={user.id}>{user.email || user.phone}</option>)}</select><button type="button" onClick={() => void grantAccess()} className="rounded bg-violet-600 px-3 text-sm text-white">Grant</button></div>}</div><div className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-white">Payment requests</h2><ul className="mt-3 space-y-2 text-sm text-gray-400">{orders.map(order => <li key={order.id} className="flex items-center justify-between gap-2"><span>{order.user.email || order.user.phone} · {order.currency} {order.amount} · {order.status}</span>{order.status === 'PENDING' && <button type="button" onClick={() => void verifyOrder(order.id)} className="text-violet-400">Verify</button>}</li>)}</ul></div></div>}
    <div className="flex items-center gap-4"><button disabled={saving} className="rounded-lg bg-violet-600 px-5 py-2 text-sm text-white">{saving ? 'Saving…' : 'Save course'}</button>{id && <button type="button" onClick={() => void deleteCourse()} className="rounded-lg border border-red-800 px-5 py-2 text-sm text-red-400">Delete course</button>}{message && <span className="text-sm text-gray-400">{message}</span>}</div>
  </form>
}
