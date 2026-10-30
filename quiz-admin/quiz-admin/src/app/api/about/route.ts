import { NextResponse } from 'next/server'
import { getAboutPage, defaultAbout } from '@/lib/about'

export const dynamic = 'force-dynamic'

export async function GET() {
  const about = await getAboutPage()
  return NextResponse.json(about || { ...defaultAbout, people: [] }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
