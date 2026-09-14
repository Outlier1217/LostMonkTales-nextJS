import Link from 'next/link'
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'

const socialLinks = [
  { href: 'https://www.instagram.com/lostmonktales?igsh=Y2E1ZnNldDZ6Mm5r&utm_source=qr', label: 'Instagram', icon: Instagram },
  { href: 'https://www.facebook.com/people/LostMonktales/100063714177033/', label: 'Facebook', icon: Facebook },
  { href: 'https://x.com/lostmonktales?s=21&t=fod423MxqD3PORBde4pCiA', label: 'X', icon: Twitter },
  { href: 'https://www.youtube.com/@lostmonktales', label: 'YouTube', icon: Youtube },
  { href: 'https://www.linkedin.com/in/ar-sumit-k-pahil-91217a101?utm_source=share_via&utm_content=profile&utm_medium=member_ios', label: 'LinkedIn', icon: Linkedin },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d9cdb9] bg-[#171310] text-[#f7f2eb]">
      <div className="section-shell py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="lm-mono mb-4 text-[0.62rem] text-[#f2801c]">Lost Monk Tales</p>
            <h2 className="lm-display max-w-md text-4xl leading-tight text-[#f7f2eb] md:text-5xl">
              Stories, spaces, and ideas worth keeping.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#b9aaa0]">
              Explore a growing world of stories, art, architecture, and curious challenges.
            </p>
          </div>

          <div>
            <p className="lm-mono mb-5 text-[0.62rem] text-[#f2801c]">Explore</p>
            <div className="grid gap-3 text-sm text-[#d7cbc2]">
              <Link href="/blogs" className="transition hover:text-[#f2801c]">Blogs</Link>
              <Link href="/quizzes" className="transition hover:text-[#f2801c]">Quizzes</Link>
              <Link href="/store" className="transition hover:text-[#f2801c]">Store</Link>
              <Link href="/architecture" className="transition hover:text-[#f2801c]">Architecture</Link>
              <Link href="/contact" className="transition hover:text-[#f2801c]">Contact Us</Link>
            </div>
          </div>

          <div>
            <p className="lm-mono mb-5 text-[0.62rem] text-[#f2801c]">Contact Info</p>
            <div className="space-y-4 text-sm leading-6 text-[#d7cbc2]">
              <a href="https://www.google.com/maps?ll=28.351134,77.28527&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=10403786810668859038" target="_blank" rel="noreferrer" className="flex gap-3 transition hover:text-[#f2801c]"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#f2801c]" /><span>8122/6017, Block F, Sanjay Colony, Sector 23, Faridabad, Haryana 121005</span></a>
              <a href="tel:+918882744327" className="flex items-center gap-3 transition hover:text-[#f2801c]"><Phone className="h-4 w-4 shrink-0 text-[#f2801c]" />+91 88827 44327</a>
              <a href="mailto:support@lostmonktales.com" className="flex items-center gap-3 transition hover:text-[#f2801c]"><Mail className="h-4 w-4 shrink-0 text-[#f2801c]" />support@lostmonktales.com</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-[#40372f] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#574a40] text-[#d7cbc2] transition hover:border-[#f2801c] hover:text-[#f2801c]"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sm text-[#d7cbc2] transition hover:text-[#f2801c]">Start a conversation <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div className="border-t border-[#40372f] px-6 py-4 text-center text-xs text-[#8f8178]">© {new Date().getFullYear()} Lost Monk Tales. All rights reserved.</div>
    </footer>
  )
}