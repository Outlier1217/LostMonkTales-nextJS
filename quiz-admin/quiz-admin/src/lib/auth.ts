import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback_secret_change_this"
)

export async function createSessionToken(username: string): Promise<string> {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  )
}