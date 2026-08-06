import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../../db/index'
import { messages } from '../../../db/schema'
import { verifyPassword } from '../../../utils/password'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody(event)
  const { email, password } = body

  const db    = getDb()
  const [row] = await db.select().from(messages).where(eq(messages.id, id))

  if (!row || !row.active) throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  if (!row.passwordHash)   throw createError({ statusCode: 403, statusMessage: 'Message has no password' })

  // Verify password
  if (!password) throw createError({ statusCode: 403, statusMessage: 'Password required' })
  const passwordOk = await verifyPassword(String(password), row.passwordHash)
  if (!passwordOk) throw createError({ statusCode: 403, statusMessage: 'Incorrect password' })

  // Verify email if one was set on the message
  if (row.email) {
    if (!email) throw createError({ statusCode: 403, statusMessage: 'Email required' })
    if (String(email).trim().toLowerCase() !== row.email.toLowerCase()) {
      throw createError({ statusCode: 403, statusMessage: 'Incorrect email' })
    }
  }

  return { ok: true }
})
