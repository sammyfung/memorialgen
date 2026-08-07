import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const dialect = process.env.NUXT_DB_DIALECT || 'sqlite'

const mod = dialect === 'postgres'
  ? require('./schema.pg')
  : dialect === 'mariadb'
  ? require('./schema.mysql')
  : require('./schema.sqlite')

export const messages      = mod.messages
export const messageImages = mod.messageImages

// Explicit types consistent across all dialects
export type Message = {
  id:           number
  name:         string
  message:      string
  email:        string | null
  passwordHash: string | null
  highlight:    boolean
  active:       boolean
  customFields: string | null
  createTime:   number
  updateTime:   number
}

export type NewMessage   = Omit<Message, 'id'>
export type MessageImage = {
  id:        number
  messageId: number
  path:      string
  order:     number
}
