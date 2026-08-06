import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { messages } from '../../db/schema'
import { verifyPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body  = await readBody(event)
  const db    = getDb()
  const [row] = await db.select().from(messages).where(eq(messages.id, id))

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  if (row.passwordHash) {
    if (!body?.password) throw createError({ statusCode: 403, statusMessage: 'Password required' })
    const ok = await verifyPassword(String(body.password), row.passwordHash)
    if (!ok)             throw createError({ statusCode: 403, statusMessage: 'Incorrect password' })
  }

  // Soft delete: set active = false
  await db.update(messages).set({ active: false, updateTime: Date.now() }).where(eq(messages.id, id))

  return { success: true }
})
