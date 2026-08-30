import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, normalizeEmail, normalizePhone } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body.email ? normalizeEmail(body.email) : null
    const phone = body.phone ? normalizePhone(body.phone) : null
    const password = String(body.password || '').trim()
    const image = body.image ? String(body.image).trim() : null

    if (!email && !phone) {
      return NextResponse.json({ error: 'Please enter an email or phone number' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'This email or phone is already registered' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        image,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        image: true,
      },
    })

    const response = NextResponse.json({ success: true, user })
    const token = await (await import('@/lib/auth')).createUserSessionToken(user.id)
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('signup error', error)
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 })
  }
}
