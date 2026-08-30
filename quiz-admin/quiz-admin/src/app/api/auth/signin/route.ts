import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, normalizeEmail, normalizePhone } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const identifier = String(body.identifier || '').trim()
    const password = String(body.password || '').trim()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/phone and password are required' }, { status: 400 })
    }

    const email = identifier.includes('@') ? normalizeEmail(identifier) : null
    const phone = email ? null : normalizePhone(identifier)

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    })

    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      image: user.image,
    } })

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
    console.error('signin error', error)
    return NextResponse.json({ error: 'Unable to sign in' }, { status: 500 })
  }
}
