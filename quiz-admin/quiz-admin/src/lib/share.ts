export type ShareResult = 'shared' | 'copied' | 'cancelled'

export async function shareLink(title: string, text: string, url?: string): Promise<ShareResult> {
  const shareUrl = new URL(url || window.location.href, window.location.origin).toString()

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl)
    return 'copied'
  } catch {
    const input = document.createElement('textarea')
    input.value = shareUrl
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    input.remove()
    if (!copied) throw new Error('Unable to copy the link')
    return 'copied'
  }
}
