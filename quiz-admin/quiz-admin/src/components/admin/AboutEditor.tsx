'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

type Person = { id: string; name: string; designation: string; bio?: string | null; image?: string | null; kind: string; sortOrder: number }
type About = {
  id?: string
  people: Person[]
  [key: string]: string | Person[] | undefined
}

const fields = [
  ['title', 'Page title'], ['tagline', 'Tagline'], ['introduction', 'Introduction'],
  ['whatWeDo', 'What We Do'], ['quizzesCourses', 'Quizzes, Courses & Exam Preparation'],
  ['studioVision', 'Beyond Religion — The Studio LM Vision'], ['philosophy', 'Our Philosophy'],
  ['closing', 'Closing statement'], ['founderName', 'Founder name'],
  ['founderDesignation', 'Founder designation'], ['founderBio', 'Founder biography'], ['founderImage', 'Founder image URL'],
] as const

const emptyPerson = { name: '', designation: '', bio: '', image: '', kind: 'TEAM', sortOrder: 0 }

export default function AboutEditor() {
  const router = useRouter()
  const [about, setAbout] = useState<About | null>(null)
  const [person, setPerson] = useState({ ...emptyPerson })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/about').then(async response => {
      if (!response.ok) throw new Error('Unable to load About content.')
      setAbout(await response.json())
    }).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to load About content.'))
  }, [])

  function update(key: string, value: string) {
    setAbout(current => current ? { ...current, [key]: value } : current)
  }

  function value(key: string) {
    const current = about?.[key]
    return typeof current === 'string' ? current : ''
  }

  async function upload(file: File, target: 'founderImage' | 'person') {
    const form = new FormData()
    form.append('files', file)
    const response = await fetch('/api/upload', { method: 'POST', body: form })
    const data = await response.json()
    if (!response.ok || !data.urls?.[0]) throw new Error('Image upload failed.')
    if (target === 'founderImage') update('founderImage', data.urls[0])
    else setPerson(current => ({ ...current, image: data.urls[0] }))
  }

  async function save() {
    if (!about) return
    setSaving(true); setMessage('')
    const response = await fetch('/api/admin/about', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(about) })
    setMessage(response.ok ? 'About page saved.' : 'Unable to save About page.')
    setSaving(false)
    router.refresh()
  }

  async function addPerson() {
    if (!person.name.trim() || !person.designation.trim()) return setMessage('Name and designation are required.')
    const response = await fetch('/api/admin/about', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(person) })
    if (!response.ok) return setMessage('Unable to add person.')
    setPerson({ ...emptyPerson }); setMessage('Person added.')
    const refreshed = await fetch('/api/admin/about')
    setAbout(await refreshed.json())
  }

  async function removePerson(id: string) {
    const response = await fetch(`/api/admin/about/${id}`, { method: 'DELETE' })
    if (!response.ok) return setMessage('Unable to remove person.')
    setAbout(current => current ? { ...current, people: current.people.filter(item => item.id !== id) } : current)
  }

  if (!about) return <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-sm text-gray-400">{message || 'Loading About content...'}</div>

  return (
    <div className="max-w-5xl space-y-8">
      <div><p className="text-sm text-[#f2801c]">Site content</p><h1 className="mt-1 text-3xl font-semibold text-white">About page</h1><p className="mt-2 text-sm text-gray-500">Shape the story visitors see at /about.</p></div>
      <section className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        {fields.map(([key, label]) => (
          <label key={key} className="block text-sm text-gray-300"><span className="mb-2 block font-medium">{label}</span>
            {key.toLowerCase().includes('image') ? <input value={value(key)} onChange={event => update(key, event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="https://..." /> : key === 'title' || key === 'tagline' || key === 'founderName' || key === 'founderDesignation' ? <input value={value(key)} onChange={event => update(key, event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" /> : <textarea value={value(key)} onChange={event => update(key, event.target.value)} rows={key === 'introduction' || key === 'founderBio' ? 8 : 5} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm leading-6 text-white" />}
          </label>
        ))}
        <label className="block text-sm text-gray-300">Upload founder image<input type="file" accept="image/*" onChange={event => event.target.files?.[0] && upload(event.target.files[0], 'founderImage')} className="mt-2 block text-xs text-gray-500" /></label>
        <Button onClick={save} loading={saving}>Save About page</Button>
      </section>
      <section className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div><h2 className="text-xl font-semibold text-white">Founder & team</h2><p className="mt-1 text-sm text-gray-500">Add additional team profiles with a name, designation, bio, and image.</p></div>
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Name" value={person.name} onChange={event => setPerson({ ...person, name: event.target.value })} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" />
          <input placeholder="Designation" value={person.designation} onChange={event => setPerson({ ...person, designation: event.target.value })} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" />
          <textarea placeholder="Short bio" value={person.bio} onChange={event => setPerson({ ...person, bio: event.target.value })} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white md:col-span-2" />
          <input placeholder="Image URL" value={person.image} onChange={event => setPerson({ ...person, image: event.target.value })} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" />
          <label className="text-xs text-gray-500">Upload image<input type="file" accept="image/*" onChange={event => event.target.files?.[0] && upload(event.target.files[0], 'person')} className="mt-2 block" /></label>
        </div>
        <Button onClick={addPerson}>Add team member</Button>
        <div className="space-y-2 border-t border-gray-800 pt-4">{about.people.filter(item => item.kind === 'TEAM').map(item => <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-950 p-3"><div><p className="text-sm text-white">{item.name}</p><p className="text-xs text-gray-500">{item.designation}</p></div><button onClick={() => removePerson(item.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button></div>)}</div>
      </section>
      {message && <p className="text-sm text-[#f2801c]">{message}</p>}
    </div>
  )
}
