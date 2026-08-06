import { defineEventHandler, setResponseHeaders, send } from 'h3'

export default defineEventHandler((event) => {
  const config      = useRuntimeConfig()
  const allowOrigin = (config as any).allowedOrigin || config.public.siteUrl || '*'

  setResponseHeaders(event, {
    'Access-Control-Allow-Origin':  allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  })

  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    return send(event, '')
  }
})
