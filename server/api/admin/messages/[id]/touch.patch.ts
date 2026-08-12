import { defineEventHandler, getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../../../db/index'
import { messages } from '../../../../db/schema'
import { getAdminSession } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  if (!session.admin) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db    = getDb()
  const [row] = await db.select().from(messages).where(eq(messages.id, id))
  if (!row)   throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  const now = Date.now()
  await db.update(messages).set({ updateTime: now }).where(eq(messages.id, id))
  return { id, updateTime: now }
})
