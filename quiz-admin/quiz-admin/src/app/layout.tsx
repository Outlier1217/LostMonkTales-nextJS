import type { Metadata } from 'next'
import './globals.css'
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['400', '500', '600'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['400', '500'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://lostmonktales.com'),
  title: {
    default: 'Lost Monk Tales',
    template: '%s | Lost Monk Tales',
  },
  description: 'Lost Monk Tales brings together stories, art, architecture, and immersive quizzes in one refined world.',
  applicationName: 'Lost Monk Tales',
  icons: {
    icon: '/fav-icon.png',
    shortcut: '/fav-icon.png',
    apple: '/fav-icon.png',
  },
  openGraph: {
    title: 'Lost Monk Tales',
    description: 'Stories, architecture, art and curated experiences from Lost Monk Tales.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <div className="site-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
