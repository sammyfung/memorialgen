import { defineEventHandler, createError } from 'h3'
import { getAdminSession } from '../utils/session'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/admin/')) return

  // Allow the login route itself
  if (event.path === '/api/admin/auth' && event.method === 'POST') return

  const session = await getAdminSession(event)
  if (!session.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
