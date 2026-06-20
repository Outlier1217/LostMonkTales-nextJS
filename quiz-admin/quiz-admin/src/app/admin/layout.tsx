import Link from 'next/link'
import { BookOpen, LayoutDashboard, ListChecks, FileText } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-60 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100">Quiz Admin</p>
              <p className="text-xs text-gray-500">Outlier Lab</p>
            </div>
          </Link>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/admin/quizzes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all">
            <ListChecks className="w-4 h-4" />
            All Quizzes
          </Link>
          <Link href="/admin/blogs" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all">
            <BookOpen className="w-4 h-4" />
            <FileText className="w-4 h-4" />
            Blogs
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">Quiz Admin v1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
