import type { Metadata } from 'next'
import './globals.css'
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['400','500','600'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['400','500'] })


export const metadata: Metadata = {
  title: 'Quiz Admin Panel',
  description: 'Manage quizzes and questions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
