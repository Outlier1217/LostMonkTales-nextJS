import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(blogs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, category, topic, content, youtubeUrl, isPublished } = body

  if (!title || !category || !topic || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const blog = await prisma.blog.create({
    data: { title, category, topic, content, youtubeUrl: youtubeUrl || null, isPublished: isPublished ?? false },
  })
  return NextResponse.json(blog, { status: 201 })
}