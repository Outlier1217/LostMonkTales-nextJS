import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback_secret_change_this"
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const token = req.cookies.get("admin_session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}