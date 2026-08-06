import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { messages, messageImages } from '../../db/schema'
import { verifyPassword, hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody(event)
  const { name, message, email, password, newPassword, customFields, imagePaths } = body

  const db    = getDb()
  const [row] = await db.select().from(messages).where(eq(messages.id, id))

  if (!row)         throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  if (!row.active)  throw createError({ statusCode: 403, statusMessage: 'Message is not available' })

  // Require password (and email if one was stored) when a password is set
  if (row.passwordHash) {
    if (!password) throw createError({ statusCode: 403, statusMessage: 'Password required' })
    const ok = await verifyPassword(String(password), row.passwordHash)
    if (!ok)       throw createError({ statusCode: 403, statusMessage: 'Incorrect password' })

    if (row.email) {
      if (!email) throw createError({ statusCode: 403, statusMessage: 'Email required' })
      if (String(email).trim().toLowerCase() !== row.email.toLowerCase()) {
        throw createError({ statusCode: 403, statusMessage: 'Incorrect email' })
      }
    }
  }

  const now        = Date.now()
  const customJson = customFields && typeof customFields === 'object'
    ? JSON.stringify(customFields)
    : row.customFields

  const newHash = newPassword ? await hashPassword(String(newPassword)) : row.passwordHash

  await db.update(messages).set({
    name:         name         ? String(name).trim()    : row.name,
    message:      message      ? String(message).trim() : row.message,
    email:        email !== undefined ? (email ? String(email).trim() : null) : row.email,
    passwordHash: newHash,
    customFields: customJson,
    updateTime:   now,
  }).where(eq(messages.id, id))

  // Replace images if provided
  if (imagePaths && Array.isArray(imagePaths)) {
    await db.delete(messageImages).where(eq(messageImages.messageId, id))
    if (imagePaths.length > 0) {
      await db.insert(messageImages).values(
        imagePaths.map((path: string, i: number) => ({
          messageId: id,
          path:      String(path),
          order:     i,
        }))
      )
    }
  }

  const [updated] = await db.select().from(messages).where(eq(messages.id, id))
  const imgs      = await db.select().from(messageImages).where(eq(messageImages.messageId, id))

  return {
    id:           updated.id,
    name:         updated.name,
    message:      updated.message,
    highlight:    updated.highlight,
    active:       updated.active,
    customFields: updated.customFields ? JSON.parse(updated.customFields) : null,
    images:       imgs.map(img => img.path),
    createTime:   updated.createTime,
    updateTime:   updated.updateTime,
    hasPassword:  !!updated.passwordHash,
  }
})
