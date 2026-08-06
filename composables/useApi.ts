export function useApi() {
  const config = useRuntimeConfig()
  const base   = (config.public.apiBaseUrl as string) || ''

  async function apiFetch<T = any>(path: string, options?: Parameters<typeof $fetch>[1]): Promise<T> {
    return $fetch<T>(`${base}${path}`, options)
  }

  return { apiFetch }
}
