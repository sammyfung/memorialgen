export function useAdminAuth() {
  const isAdmin = useState<boolean>('admin_authenticated', () => false)
  const { apiFetch } = useApi()

  async function login(password: string): Promise<boolean> {
    try {
      await apiFetch('/api/admin/auth', { method: 'POST', body: { password } })
      isAdmin.value = true
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    await apiFetch('/api/admin/auth', { method: 'DELETE' })
    isAdmin.value = false
    await navigateTo('/admin/login')
  }

  return { isAdmin, login, logout }
}
