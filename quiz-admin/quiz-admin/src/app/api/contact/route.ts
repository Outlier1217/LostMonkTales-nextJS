import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or fewer.' }, { status: 400 })
    }

    await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, message },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 500 })
  }
}
