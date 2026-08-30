import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getUserSession()
    if (!session || typeof session.userId !== 'string') {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        image: true,
      },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
