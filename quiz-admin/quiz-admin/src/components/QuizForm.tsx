'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

interface QuizFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

const CATEGORIES = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Computer Science', 'Finance', 'Blockchain', 'General Knowledge', 'Other'
]

export function QuizForm({ initialData, mode }: QuizFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    difficulty: initialData?.difficulty || 'MEDIUM',
    category: initialData?.category || 'General Knowledge',
    topic: initialData?.topic || '',
    timeLimit: initialData?.timeLimit ?? 30,
    negativeMarking: initialData?.negativeMarking ?? false,
    negativePenalty: initialData?.negativePenalty ?? 0.25,
    passingPercent: initialData?.passingPercent ?? 60,
    isPublished: initialData?.isPublished ?? false,
  })

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/quizzes' : `/api/quizzes/${initialData.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          timeLimit: Number(form.timeLimit),
          negativePenalty: Number(form.negativePenalty),
          passingPercent: Number(form.passingPercent),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const quiz = await res.json()
      router.push(`/admin/quizzes/${quiz.id}/questions`)
      router.refresh()
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            id="title"
            label="Quiz Title *"
            placeholder="e.g. NISM Series 8 Mock Test"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            id="description"
            label="Description"
            placeholder="Brief description of this quiz..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
          />
        </div>

        <Select
          id="difficulty"
          label="Difficulty Level *"
          value={form.difficulty}
          onChange={e => set('difficulty', e.target.value)}
        >
          <option value="EASY">🟢 Easy</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="HARD">🔴 Hard</option>
        </Select>

        <Select
          id="category"
          label="Category *"
          value={form.category}
          onChange={e => set('category', e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>

        <div className="md:col-span-2">
          <Input
            id="topic"
            label="Topic *"
            placeholder="e.g. Derivatives, Equity, Options Trading"
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            required
          />
        </div>

        <Input
          id="timeLimit"
          label="Time Limit (minutes) — 0 for unlimited"
          type="number"
          min="0"
          max="300"
          value={form.timeLimit}
          onChange={e => set('timeLimit', e.target.value)}
        />

        <Input
          id="passingPercent"
          label="Passing Percentage (%)"
          type="number"
          min="1"
          max="100"
          step="0.5"
          value={form.passingPercent}
          onChange={e => set('passingPercent', e.target.value)}
        />
      </div>

      {/* Negative Marking */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Negative Marking</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('negativeMarking', false)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
              !form.negativeMarking
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            ✗ No Negative Marking
          </button>
          <button
            type="button"
            onClick={() => set('negativeMarking', true)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
              form.negativeMarking
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            ✓ Yes, Negative Marking
          </button>
        </div>

        {form.negativeMarking && (
          <Select
            id="negativePenalty"
            label="Penalty per Wrong Answer"
            value={form.negativePenalty}
            onChange={e => set('negativePenalty', e.target.value)}
          >
            <option value="0.25">0.25 marks (1/4 deducted)</option>
            <option value="0.33">0.33 marks (1/3 deducted)</option>
            <option value="0.5">0.5 marks (1/2 deducted)</option>
            <option value="1">1 mark (Full mark deducted)</option>
          </Select>
        )}
      </div>

      {/* Publish Status */}
      <div className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <input
          type="checkbox"
          id="isPublished"
          checked={form.isPublished}
          onChange={e => set('isPublished', e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-200 cursor-pointer">
            Publish this quiz
          </label>
          <p className="text-xs text-gray-500">Published quizzes are visible to users</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          {mode === 'create' ? 'Create Quiz & Add Questions →' : 'Save Changes'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
