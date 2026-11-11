'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function CourseCategorySelect({ value, categories }: { value: string; categories: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function changeCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (category) params.set('category', category)
    else params.delete('category')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <select value={value} onChange={event => changeCategory(event.target.value)} aria-label="Filter courses by category" className="rounded-full border border-[#d7c3a1] bg-transparent px-4 py-3">
      <option value="">All categories</option>
      {categories.map(category => <option key={category} value={category}>{category}</option>)}
    </select>
  )
}
