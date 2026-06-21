import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  
  if (!url) return new NextResponse('Missing url', { status: 400 })
  
  // Sirf apne VPS ka URL allow karo
  if (!url.startsWith('http://88.222.244.226:3021/')) {
    return new NextResponse('Not allowed', { status: 403 })
  }

  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'

  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
  })
}