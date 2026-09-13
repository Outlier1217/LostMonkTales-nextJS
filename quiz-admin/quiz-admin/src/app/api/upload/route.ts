import { NextResponse } from 'next/server'

const FILE_SERVER_INTERNAL_URL = (process.env.FILE_SERVER_INTERNAL_URL || process.env.FILE_SERVER_URL || 'http://127.0.0.1:3021').replace(/\/$/, '')
const FILE_SERVER_PUBLIC_URL = (process.env.FILE_SERVER_PUBLIC_URL || 'http://88.222.244.226:3021').replace(/\/$/, '')

export async function POST(req: Request) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 })

  const uploaded: string[] = []

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const res = await fetch(`${FILE_SERVER_INTERNAL_URL}/upload`, {
        method: 'POST',
        headers: {
          'x-filename': file.name,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: buffer,
        signal: AbortSignal.timeout(30_000),
      })

      if (!res.ok) {
        const details = await res.text().catch(() => '')
        console.error('File server rejected upload', res.status, details)
        return NextResponse.json({ error: `File server rejected ${file.name} (${res.status})` }, { status: 502 })
      }

      const data = await res.json() as { url?: string }
      if (!data.url) {
        console.error('File server returned no URL', data)
        return NextResponse.json({ error: `File server returned no URL for ${file.name}` }, { status: 502 })
      }

      const fileUrl = new URL(data.url, `${FILE_SERVER_INTERNAL_URL}/`)
      const publicUrl = new URL(FILE_SERVER_PUBLIC_URL)
      fileUrl.protocol = publicUrl.protocol
      fileUrl.hostname = publicUrl.hostname
      fileUrl.port = publicUrl.port
      uploaded.push(fileUrl.toString())
    } catch (error) {
      console.error('File server upload error', error)
      return NextResponse.json({ error: 'Unable to reach the VPS file server' }, { status: 502 })
    }
  }

  return NextResponse.json({ urls: uploaded })
}