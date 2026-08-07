import * as sqlite from './schema.sqlite'
import * as mysql  from './schema.mysql'
import * as pg     from './schema.pg'

const dialect = process.env.NUXT_DB_DIALECT || 'sqlite'

const mod = dialect === 'postgres'
  ? pg
  : dialect === 'mariadb'
  ? mysql
  : sqlite

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
