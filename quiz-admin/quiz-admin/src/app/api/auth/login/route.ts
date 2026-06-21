import { NextRequest, NextResponse } from "next/server"
import { verifyCredentials, createSessionToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await createSessionToken(username)

  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return res
}