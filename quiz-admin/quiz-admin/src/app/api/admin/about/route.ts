import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { defaultAbout, getAboutPage } from '@/lib/about'
import { prisma } from '@/lib/db'

async function authorized() {
  return Boolean((await getSession())?.username)
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getAboutPage() || { ...defaultAbout, people: [] }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}

export async function PUT(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  const data = Object.fromEntries(Object.keys(defaultAbout).map(key => [key, typeof body[key] === 'string' ? body[key] : defaultAbout[key as keyof typeof defaultAbout]]))
  const current = await getAboutPage()
  const about = current
    ? await prisma.aboutPage.update({ where: { id: current.id }, data })
    : await prisma.aboutPage.create({ data })
  return NextResponse.json(about)
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  const about = await getAboutPage()
  if (!about) return NextResponse.json({ error: 'Save the About page before adding people.' }, { status: 400 })
  const person = await prisma.aboutPerson.create({
    data: {
      aboutPageId: about.id,
      name: typeof body.name === 'string' ? body.name.trim() : '',
      designation: typeof body.designation === 'string' ? body.designation.trim() : '',
      bio: typeof body.bio === 'string' ? body.bio.trim() || null : null,
      image: typeof body.image === 'string' ? body.image.trim() || null : null,
      kind: body.kind === 'FOUNDER' ? 'FOUNDER' : 'TEAM',
      sortOrder: Number(body.sortOrder) || 0,
    },
  })
  return NextResponse.json(person, { status: 201 })
}
