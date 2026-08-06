import { defineEventHandler } from 'h3'
import { getAdminSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  session.destroy()
  return { ok: true }
})
