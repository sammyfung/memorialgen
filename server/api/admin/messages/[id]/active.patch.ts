import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../../../db/index'
import { messages } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body  = await readBody(event)
  const db    = getDb()
  const [row] = await db.select().from(messages).where(eq(messages.id, id))
  if (!row)   throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  const active = body?.active !== undefined ? !!body.active : !row.active

  await db.update(messages).set({ active, updateTime: Date.now() }).where(eq(messages.id, id))
  return { id, active }
})
