import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'div', 'em', 'figcaption',
  'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p',
  'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul',
]

export function sanitizeBlogHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags,
    allowedAttributes: {
      '*': ['class', 'style', 'title'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
  })
}

export function isHtmlContent(content: string) {
  return /<([a-z][^\s/>]*)\b[^>]*>/i.test(content)
}

export function getBlogExcerpt(content: string, length = 170) {
  const plainText = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/[#*_>`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `${plainText.slice(0, length).trimEnd()}${plainText.length > length ? '...' : ''}`
}