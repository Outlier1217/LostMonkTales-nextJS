import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, ListChecks, Palette, FileText, Building2, Image as ImageIcon, MessageSquare, Users, GraduationCap, Sparkles } from 'lucide-react'
import LogoutButton from "@/components/ui/LogoutButton"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#100e0d] text-gray-100 flex">
      <aside className="w-64 border-r border-[#2c2521] bg-[#171310] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#2c2521]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f7f2eb] flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="" width={100} height={40} className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100">Lost Monk Tales</p>
              <p className="text-xs text-[#b9aaa0]">Studio dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <Link href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link href="/admin/quizzes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
            <ListChecks className="w-4 h-4" />
            All Quizzes
          </Link>
          <Link href="/admin/courses"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
            <GraduationCap className="w-4 h-4" />
            Courses
          </Link>

          <Link href="/admin/blogs"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
            <FileText className="w-4 h-4" />
            Blogs
          </Link>

          <Link href="/admin/art"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
            <Palette className="w-4 h-4" />
            Art Store
          </Link>
          <Link href="/admin/portraits"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
          <ImageIcon className="w-4 h-4" />
          Art & Portraits
        </Link>

        <Link href="/admin/architecture"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
        text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
        <Building2 className="w-4 h-4" />
        Architecture
      </Link>

        <Link href="/admin/messages"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
          <MessageSquare className="w-4 h-4" />
          Messages
        </Link>

        <Link href="/admin/users"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            text-gray-400 hover:text-white hover:bg-[#2a211d] transition-all">
          <Users className="w-4 h-4" />
          Users
        </Link>
        </nav>

        <div className="p-4 border-t border-[#2c2521] space-y-3">
          <LogoutButton />
          <p className="flex items-center gap-2 text-xs text-[#8f8178]"><Sparkles className="h-3 w-3 text-[#f2801c]" /> Curate the homepage</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_rgba(242,128,28,0.08),_transparent_34%)] p-6 md:p-10">{children}</main>
    </div>
  )
}