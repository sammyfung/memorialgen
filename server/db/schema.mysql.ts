import { mysqlTable, serial, int, varchar, text, boolean, bigint } from 'drizzle-orm/mysql-core'

export const messages = mysqlTable('messages', {
  id:           serial('id').primaryKey(),
  name:         varchar('name', { length: 255 }).notNull(),
  message:      text('message').notNull(),
  email:        varchar('email', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  highlight:    boolean('highlight').default(false).notNull(),
  active:       boolean('active').default(true).notNull(),
  customFields: text('custom_fields'),
  createTime:   bigint('create_time', { mode: 'number' }).notNull(),
  updateTime:   bigint('update_time', { mode: 'number' }).notNull(),
})

export const messageImages = mysqlTable('message_images', {
  id:        serial('id').primaryKey(),
  messageId: int('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  path:      varchar('path', { length: 500 }).notNull(),
  order:     int('order').default(0).notNull(),
})
