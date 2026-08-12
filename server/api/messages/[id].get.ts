import { defineEventHandler, getRouterParam, createError } from 'h3'
import { eq, and } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { messages, messageImages } from '../../db/schema'
import { getAdminSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const session = await getAdminSession(event)
  const isAdmin = !!session.admin

  const db = getDb()

  const [row] = await db.select().from(messages)
    .where(isAdmin ? eq(messages.id, id) : and(eq(messages.id, id), eq(messages.active, true)))

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  const images = await db.select().from(messageImages)
    .where(eq(messageImages.messageId, id))

  return {
    id:           row.id,
    name:         row.name,
    message:      row.message,
    highlight:    row.highlight,
    active:       row.active,
    customFields: row.customFields ? JSON.parse(row.customFields) : null,
    images:       images.map(img => img.path),
    createTime:   row.createTime,
    updateTime:   row.updateTime,
    hasPassword:  !!row.passwordHash,
  }
})
