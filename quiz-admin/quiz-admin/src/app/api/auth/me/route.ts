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

export async function PATCH(req: Request) {
  try {
    const session = await getUserSession()
    if (!session || typeof session.userId !== 'string') {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    const body = await req.json()
    const phone = body.phone ? String(body.phone).replace(/\D/g, '') : null
    const image = body.image ? String(body.image).trim() : null
    if (phone && phone.length < 7) return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { phone, image },
      select: { id: true, email: true, phone: true, image: true },
    })
    return NextResponse.json({ user })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'This phone number is already registered' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 })
  }
}
