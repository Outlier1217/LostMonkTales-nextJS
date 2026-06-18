import { QuizForm } from '@/components/QuizForm'

export default function NewQuizPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Create New Quiz</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below, then add questions</p>
      </div>
      <QuizForm mode="create" />
    </div>
  )
}
