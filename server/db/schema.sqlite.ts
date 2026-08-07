import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const messages = sqliteTable('messages', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  name:         text('name').notNull(),
  message:      text('message').notNull(),
  email:        text('email'),
  passwordHash: text('password_hash'),
  highlight:    integer('highlight', { mode: 'boolean' }).default(false).notNull(),
  active:       integer('active', { mode: 'boolean' }).default(true).notNull(),
  customFields: text('custom_fields'),
  createTime:   integer('create_time').notNull(),
  updateTime:   integer('update_time').notNull(),
})

export const messageImages = sqliteTable('message_images', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  messageId: integer('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  path:      text('path').notNull(),
  order:     integer('order').default(0).notNull(),
})
