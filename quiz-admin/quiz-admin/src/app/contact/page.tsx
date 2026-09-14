'use client'

import { FormEvent, useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

const mapUrl = 'https://www.google.com/maps?ll=28.351134,77.28527&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=10403786810668859038'
const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3510.3654040908236!2d77.32048927527924!3d28.37802947580468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdb55072da2fd%3A0x91e20f6254c675c9!2sSTUDIO%20LM!5e0!3m2!1sen!2sin!4v1789386821487!5m2!1sen!2sin'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to send your message.')
      setForm({ name: '', email: '', phone: '', message: '' })
      setStatus('success')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to send your message.')
      setStatus('error')
    }
  }

  return (
    <main className="lm-page">
      <section className="section-shell py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="lm-mono mb-4 text-[0.68rem] text-[#ca6706]">Contact Us</p>
          <h1 className="lm-display text-5xl leading-tight text-[#171310] md:text-7xl">Let&apos;s make room for a good conversation.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f564f]">Have a question, a collaboration idea, or something worth sharing? Send us a message and the Lost Monk Tales team will get back to you.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] bg-[#171310] p-7 text-[#f7f2eb] md:p-9">
            <p className="lm-mono mb-6 text-[0.62rem] text-[#f2801c]">Find us</p>
            <div className="space-y-6 text-sm leading-7 text-[#d7cbc2]">
              <a href={mapUrl} target="_blank" rel="noreferrer" className="flex gap-4 transition hover:text-[#f2801c]"><MapPin className="mt-1 h-5 w-5 shrink-0 text-[#f2801c]" /><span>8122/6017, Block F, Sanjay Colony, Sector 23, Faridabad, Haryana 121005</span></a>
              <a href="tel:+918882744327" className="flex items-center gap-4 transition hover:text-[#f2801c]"><Phone className="h-5 w-5 shrink-0 text-[#f2801c]" />+91 88827 44327</a>
              <a href="mailto:support@lostmonktales.com" className="flex items-center gap-4 transition hover:text-[#f2801c]"><Mail className="h-5 w-5 shrink-0 text-[#f2801c]" />support@lostmonktales.com</a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#eadbc0] bg-white/75 p-7 shadow-[0_20px_60px_rgba(23,19,16,0.05)] md:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[#171310]">Name *<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-[#d7c3a1] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#f2801c]" placeholder="Your name" /></label>
              <label className="space-y-2 text-sm font-medium text-[#171310]">Email *<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-[#d7c3a1] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#f2801c]" placeholder="you@example.com" /></label>
            </div>
            <label className="mt-5 block space-y-2 text-sm font-medium text-[#171310]">Phone (optional)<input type="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-[#d7c3a1] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#f2801c]" placeholder="+91" /></label>
            <label className="mt-5 block space-y-2 text-sm font-medium text-[#171310]">Message *<textarea required rows={6} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="w-full resize-y rounded-xl border border-[#d7c3a1] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#f2801c]" placeholder="Tell us what is on your mind..." /></label>
            {status === 'success' && <p className="mt-4 rounded-xl border border-[#b9d9c4] bg-[#eef9f1] px-4 py-3 text-sm text-[#28613a]">Your message has been sent. Thank you for reaching out.</p>}
            {status === 'error' && <p className="mt-4 rounded-xl border border-[#f0c4c4] bg-[#fff1f1] px-4 py-3 text-sm text-[#7a2b2b]">{error}</p>}
            <button type="submit" disabled={status === 'sending'} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#171310] px-5 py-3 text-sm font-semibold text-[#f7f2eb] transition hover:bg-[#ca6706] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{status === 'sending' ? 'Sending...' : 'Send message'}</button>
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#eadbc0] bg-white/75">
          <iframe title="Lost Monk Tales location" src={mapEmbedUrl} className="h-[360px] w-full border-0 md:h-[460px]" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </section>
    </main>
  )
}
