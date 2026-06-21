"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      router.push("/admin")
      router.refresh()
    } else {
      setError("Invalid username or password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">LostMonkTales Dashboard</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Logging in...
              </span>
            ) : "Login"}
          </button>
        </div>
      </div>
    </div>
  )
}