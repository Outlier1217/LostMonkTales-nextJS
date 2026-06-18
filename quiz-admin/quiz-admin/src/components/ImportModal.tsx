'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportModalProps {
  quizId: string
  onClose: () => void
  onSuccess: () => void
}

export function ImportModal({ quizId, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      alert('Only .csv, .xlsx, .xls files allowed')
      return
    }
    setFile(f)
    setResult(null)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)

    try {
      let csvFile = file

      // Handle Excel files client-side
      if (file.name.match(/\.xlsx?$/i)) {
        const XLSX = await import('xlsx')
        const arrayBuffer = await file.arrayBuffer()
        const wb = XLSX.read(arrayBuffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const csvText = XLSX.utils.sheet_to_csv(ws)
        csvFile = new File([csvText], file.name.replace(/\.xlsx?$/i, '.csv'), { type: 'text/csv' })
      }

      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('quizId', quizId)

      const res = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: `Successfully imported ${data.imported} questions!` })
        setTimeout(() => { onSuccess(); onClose() }, 1500)
      } else {
        setResult({ success: false, message: data.error || 'Import failed' })
      }
    } catch {
      setResult({ success: false, message: 'Import failed. Check file format.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Import Questions</h2>
            <p className="text-sm text-gray-500 mt-0.5">Upload CSV or Excel file</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-violet-500 bg-violet-500/5' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-violet-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Drop file here or <span className="text-violet-400">browse</span></p>
                <p className="text-xs text-gray-600 mt-1">Supports .csv, .xlsx, .xls</p>
              </>
            )}
          </div>

          {/* Template info */}
          <div className="bg-gray-900 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Required Columns</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>• questionText</span><span>• option1</span>
              <span>• option2</span><span>• option3</span>
              <span>• option4</span><span>• correctAnswer (A/B/C/D)</span>
            </div>
            <p className="text-xs text-gray-600 pt-1">Optional: option5, option6, explanation, marks</p>
          </div>

          {/* Result */}
          {result && (
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {result.success
                ? <CheckCircle className="w-5 h-5 flex-none" />
                : <AlertCircle className="w-5 h-5 flex-none" />
              }
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={!file} loading={loading} className="flex-1">
              Import Questions
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
