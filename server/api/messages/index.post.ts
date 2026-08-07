import { defineEventHandler, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { messages, messageImages } from '../../db/schema'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, message, email, password, highlight, customFields, imagePaths } = body

  if (!name?.trim())    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  if (!message?.trim()) throw createError({ statusCode: 400, statusMessage: 'message is required' })

  const now          = Date.now()
  const passwordHash = password ? await hashPassword(String(password)) : null
  const customJson   = customFields && typeof customFields === 'object'
    ? JSON.stringify(customFields)
    : null

  const db = getDb()

  const result = await db.insert(messages).values({
    name:         String(name).trim(),
    message:      String(message).trim(),
    email:        email ? String(email).trim() : null,
    passwordHash,
    highlight:    highlight === true || highlight === 'true',
    active:       true,
    customFields: customJson,
    createTime:   now,
    updateTime:   now,
  })

  // .returning() is not supported by MySQL — use insertId or lastInsertRowid
  const insertedId: number = (result as any).insertId
    ?? (result as any)[0]?.insertId
    ?? (result as any).lastInsertRowid

  if (imagePaths && Array.isArray(imagePaths) && imagePaths.length > 0) {
    await db.insert(messageImages).values(
      imagePaths.map((path: string, i: number) => ({
        messageId: insertedId,
        path:      String(path),
        order:     i,
      }))
    )
  }

  const [inserted] = await db.select().from(messages).where(eq(messages.id, insertedId))

  return {
    id:          inserted.id,
    name:        inserted.name,
    message:     inserted.message,
    highlight:   inserted.highlight,
    active:      inserted.active,
    createTime:  inserted.createTime,
    hasPassword: !!passwordHash,
  }
})
