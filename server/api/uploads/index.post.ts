import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTS  = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export default defineEventHandler(async (event) => {
  const config      = useRuntimeConfig()
  const maxSizeMb   = Number(config.uploadMaxSizeMb) || 5
  const maxBytes    = maxSizeMb * 1024 * 1024

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const paths: string[] = []

  for (const part of parts) {
    if (!part.filename) continue

    // Validate type
    const mime = part.type ?? ''
    if (!ALLOWED_TYPES.includes(mime)) {
      throw createError({ statusCode: 400, statusMessage: `File type ${mime} not allowed` })
    }

    // Validate size
    if (part.data.length > maxBytes) {
      throw createError({ statusCode: 400, statusMessage: `File exceeds max size of ${maxSizeMb}MB` })
    }

    // Generate safe filename
    const origExt = '.' + (part.filename.split('.').pop()?.toLowerCase() ?? 'jpg')
    if (!ALLOWED_EXTS.includes(origExt)) {
      throw createError({ statusCode: 400, statusMessage: `Extension ${origExt} not allowed` })
    }

    const filename = `${randomUUID()}${origExt}`
    await writeFile(join(uploadDir, filename), part.data)
    paths.push(`/uploads/${filename}`)
  }

  if (paths.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid image files found' })
  }

  return { paths }
})
