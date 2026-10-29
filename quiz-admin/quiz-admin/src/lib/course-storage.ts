import { mkdir, statfs } from 'node:fs/promises'
import path from 'node:path'

export const courseFileTypes: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function courseStorageRoot() {
  const configured = process.env.COURSE_FILE_STORAGE_DIR
  if (!configured) throw new Error('COURSE_FILE_STORAGE_DIR is not configured.')
  return path.resolve(configured)
}

export function courseMaxFileSize() {
  const configured = Number(process.env.COURSE_MAX_FILE_SIZE_BYTES || 100 * 1024 * 1024)
  if (!Number.isSafeInteger(configured) || configured <= 0) throw new Error('COURSE_MAX_FILE_SIZE_BYTES must be a positive integer.')
  return configured
}

export async function assertCourseStorageCapacity(root: string, incomingBytes: number) {
  const quota = Number(process.env.COURSE_STORAGE_QUOTA_BYTES || 0)
  const filesystem = await statfs(root)
  const available = filesystem.bavail * filesystem.bsize
  if (incomingBytes > available) throw new Error('Insufficient VPS disk space for this upload.')
  if (quota > 0) {
    const { readdir, stat } = await import('node:fs/promises')
    let used = 0
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (entry.isFile()) used += (await stat(path.join(root, entry.name))).size
    }
    if (used + incomingBytes > quota) throw new Error('The configured course storage quota has been reached.')
  }
}

export async function prepareCourseStorage() {
  const root = courseStorageRoot()
  await mkdir(root, { recursive: true, mode: 0o750 })
  return root
}
