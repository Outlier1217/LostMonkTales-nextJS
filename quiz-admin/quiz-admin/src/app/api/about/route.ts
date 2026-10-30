import { NextResponse } from 'next/server'
import { getAboutPage, defaultAbout } from '@/lib/about'

export async function GET() {
  const about = await getAboutPage()
  return NextResponse.json(about || { ...defaultAbout, people: [] })
}
