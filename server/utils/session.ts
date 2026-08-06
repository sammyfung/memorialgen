import { getIronSession } from 'iron-session'
import type { H3Event } from 'h3'

export interface SessionData {
  admin?: boolean
}

export async function getAdminSession(event: H3Event) {
  const config = useRuntimeConfig()
  return getIronSession<SessionData>(event.node.req, event.node.res, {
    password: config.sessionSecret,
    cookieName: 'memorial_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}
