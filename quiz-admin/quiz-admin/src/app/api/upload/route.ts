import { NextResponse } from 'next/server'

const VPS_UPLOAD_URL = 'http://88.222.244.226:3021/upload'

export async function POST(req: Request) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 })

  const uploaded: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const res = await fetch(VPS_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'x-filename': file.name,
        'Content-Type': file.type,
      },
      body: buffer,
    })
    if (!res.ok) return NextResponse.json({ error: `Failed: ${file.name}` }, { status: 500 })
    const data = await res.json()
    uploaded.push(data.url)
  }

  return NextResponse.json({ urls: uploaded })
}