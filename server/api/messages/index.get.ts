import { defineEventHandler, getQuery } from 'h3'
import { eq, and, desc, count } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { messages, messageImages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query     = getQuery(event)
  const page      = Math.max(1, parseInt(String(query.page  || 1)))
  const limit     = Math.min(50, Math.max(1, parseInt(String(query.limit || 12))))
  const highlight = query.highlight !== undefined ? query.highlight === 'true' : null
  const offset    = (page - 1) * limit

  const db = getDb()

  const conditions = [eq(messages.active, true)]
  if (highlight !== null) conditions.push(eq(messages.highlight, highlight))

  const where = and(...conditions)

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(messages).where(where),
    db.select().from(messages).where(where)
      .orderBy(desc(messages.highlight), desc(messages.createTime))
      .limit(limit)
      .offset(offset),
  ])

  const total = totalResult[0]?.count ?? 0
  const ids   = rows.map(r => r.id)

  let imageMap: Record<number, string[]> = {}
  if (ids.length > 0) {
    const images = await db.select().from(messageImages)
      .where(eq(messageImages.messageId, ids[0])) // fetch per message below
    // Fetch all images for these messages
    const allImages = await Promise.all(
      ids.map(id => db.select().from(messageImages).where(eq(messageImages.messageId, id)))
    )
    ids.forEach((id, i) => {
      imageMap[id] = allImages[i].map(img => img.path)
    })
  }

  const data = rows.map(row => ({
    id:           row.id,
    name:         row.name,
    message:      row.message,
    highlight:    row.highlight,
    active:       row.active,
    customFields: row.customFields ? JSON.parse(row.customFields) : null,
    images:       imageMap[row.id] ?? [],
    createTime:   row.createTime,
    updateTime:   row.updateTime,
    hasPassword:  !!row.passwordHash,
  }))

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
})
