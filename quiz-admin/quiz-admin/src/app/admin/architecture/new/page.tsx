import { ArchitectureForm } from '@/components/architecture/ArchitectureForm'

export default function NewArchitectureProjectPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">New Architecture Project</h1>
      <ArchitectureForm />
    </div>
  )
}