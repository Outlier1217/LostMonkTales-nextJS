import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'easy' | 'medium' | 'hard' | 'published' | 'draft' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
    published: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  )
}
