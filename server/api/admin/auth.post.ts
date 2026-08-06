import { defineEventHandler, readBody, createError } from 'h3'
import { getAdminSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body     = await readBody(event)
  const config   = useRuntimeConfig()

  if (!body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Password required' })
  }

  if (String(body.password) !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect password' })
  }

  const session = await getAdminSession(event)
  session.admin = true
  await session.save()

  return { ok: true }
})
