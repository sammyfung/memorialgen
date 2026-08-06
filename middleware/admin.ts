export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return

  // Check server session via a lightweight ping
  try {
    await $fetch('/api/admin/messages', { query: { limit: 1 } })
  } catch (e: any) {
    if (e?.statusCode === 401) {
      return navigateTo('/admin/login')
    }
  }
})
