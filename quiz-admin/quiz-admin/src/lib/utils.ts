import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOptionId(index: number): string {
  return String.fromCharCode(65 + index) // A, B, C, D...
}

export interface CsvQuestion {
  questionText: string
  option1: string
  option2: string
  option3: string
  option4: string
  option5?: string
  option6?: string
  correctAnswer: string // A, B, C, D...
  explanation?: string
  marks?: number
}

export function parseCsvToQuestions(rows: Record<string, string>[]): CsvQuestion[] {
  return rows
    .filter(row => row.questionText || row.question_text || row['Question'])
    .map(row => ({
      questionText: row.questionText || row.question_text || row['Question'] || '',
      option1: row.option1 || row.option_1 || row['Option 1'] || row['Option A'] || '',
      option2: row.option2 || row.option_2 || row['Option 2'] || row['Option B'] || '',
      option3: row.option3 || row.option_3 || row['Option 3'] || row['Option C'] || '',
      option4: row.option4 || row.option_4 || row['Option 4'] || row['Option D'] || '',
      option5: row.option5 || row.option_5 || row['Option 5'] || row['Option E'] || undefined,
      option6: row.option6 || row.option_6 || row['Option 6'] || row['Option F'] || undefined,
      correctAnswer: (row.correctAnswer || row.correct_answer || row['Correct Answer'] || row['Answer'] || 'A').toUpperCase(),
      explanation: row.explanation || row['Explanation'] || undefined,
      marks: row.marks ? parseFloat(row.marks) : 1.0,
    }))
}
