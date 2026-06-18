'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { generateOptionId } from '@/lib/utils'
import { Plus, Trash2, CheckCircle } from 'lucide-react'

interface Option { id: string; text: string }

interface QuestionFormProps {
  quizId: string
  initialData?: any
  onSaved: () => void
  onCancel: () => void
}

export function QuestionForm({ quizId, initialData, onSaved, onCancel }: QuestionFormProps) {
  const isEdit = !!initialData
  const [loading, setLoading] = useState(false)
  const [questionText, setQuestionText] = useState(initialData?.questionText || '')
  const [options, setOptions] = useState<Option[]>(
    initialData?.options || [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ]
  )
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || '')
  const [explanation, setExplanation] = useState(initialData?.explanation || '')
  const [marks, setMarks] = useState(initialData?.marks || 1)

  function addOption() {
    if (options.length >= 8) return
    const newId = generateOptionId(options.length)
    setOptions([...options, { id: newId, text: '' }])
  }

  function removeOption(id: string) {
    if (options.length <= 2) return
    const updated = options.filter(o => o.id !== id).map((o, i) => ({ ...o, id: generateOptionId(i) }))
    setOptions(updated)
    if (correctAnswer === id) setCorrectAnswer('')
  }

  function updateOption(id: string, text: string) {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!questionText.trim()) return alert('Question text is required')
    if (options.some(o => !o.text.trim())) return alert('All option texts are required')
    if (!correctAnswer) return alert('Please select the correct answer')

    setLoading(true)
    try {
      const url = isEdit ? `/api/questions/${initialData.id}` : '/api/questions'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, questionText, options, correctAnswer, explanation: explanation || null, marks: Number(marks) }),
      })
      if (!res.ok) throw new Error('Failed')
      onSaved()
    } catch {
      alert('Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-100">
        {isEdit ? 'Edit Question' : 'Add New Question'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Textarea
          label="Question Text *"
          placeholder="Type your question here..."
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          rows={3}
          required
        />

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Options *</label>
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 8}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </button>
          </div>

          <div className="space-y-2">
            {options.map((option, idx) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  correctAnswer === option.id
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                }`}
                onClick={() => setCorrectAnswer(option.id)}
              >
                <div className={`flex-none w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  correctAnswer === option.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {option.id}
                </div>
                <input
                  type="text"
                  placeholder={`Option ${option.id}`}
                  value={option.text}
                  onChange={e => { e.stopPropagation(); updateOption(option.id, e.target.value) }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 focus:outline-none"
                />
                {correctAnswer === option.id && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-none" />
                )}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeOption(option.id) }}
                    className="flex-none text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">Click on an option row to mark it as the correct answer</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marks for this question"
            type="number"
            min="0.5"
            step="0.5"
            value={marks}
            onChange={e => setMarks(e.target.value)}
          />
        </div>

        <Textarea
          label="Explanation (optional)"
          placeholder="Explain why this answer is correct..."
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          rows={2}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {isEdit ? 'Update Question' : 'Add Question'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
