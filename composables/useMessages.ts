export interface MessageImage {
  path: string
}

export interface Message {
  id: number
  name: string
  message: string
  highlight: boolean
  active: boolean
  customFields: Record<string, string> | null
  images: string[]
  createTime: number
  updateTime: number
  hasPassword: boolean
}

export interface MessagesResponse {
  data: Message[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useMessages() {
  const { apiFetch } = useApi()

  async function fetchMessages(params: {
    page?: number
    limit?: number
    highlight?: boolean
  } = {}): Promise<MessagesResponse> {
    const query: Record<string, string> = {}
    if (params.page    !== undefined) query.page    = String(params.page)
    if (params.limit   !== undefined) query.limit   = String(params.limit)
    if (params.highlight !== undefined) query.highlight = String(params.highlight)

    return apiFetch<MessagesResponse>('/api/messages', { query })
  }

  async function fetchMessage(id: number): Promise<Message> {
    return apiFetch<Message>(`/api/messages/${id}`)
  }

  async function createMessage(data: {
    name: string
    message: string
    email?: string
    password?: string
    highlight?: boolean
    customFields?: Record<string, string>
    imagePaths?: string[]
  }): Promise<Message> {
    return apiFetch<Message>('/api/messages', { method: 'POST', body: data })
  }

  async function updateMessage(id: number, data: {
    name?: string
    message?: string
    email?: string
    password?: string
    newPassword?: string
    customFields?: Record<string, string>
    imagePaths?: string[]
  }): Promise<Message> {
    return apiFetch<Message>(`/api/messages/${id}`, { method: 'PUT', body: data })
  }

  async function deleteMessage(id: number, password?: string): Promise<void> {
    await apiFetch(`/api/messages/${id}`, { method: 'DELETE', body: { password } })
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    const result = await apiFetch<{ paths: string[] }>('/api/uploads', {
      method: 'POST',
      body: form,
    })
    return result.paths
  }

  return { fetchMessages, fetchMessage, createMessage, updateMessage, deleteMessage, uploadImages }
}
