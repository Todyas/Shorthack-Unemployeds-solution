// Тонкий клиент для FastAPI-бэкенда (Smart Support Gateway).
// '??' — не '||': в Docker-сборке VITE_API_BASE_URL нарочно пустая строка
// (относительные пути, которые проксирует nginx), а '||' заменил бы её на
// дефолт и сломал прод-сборку.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {
      // тело не JSON — оставляем statusText
    }
    throw new Error(`${response.status} ${detail}`)
  }
  if (response.status === 204) return null
  return response.json()
}

export function fetchTickets(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.category) params.set('category', filters.category)
  const query = params.toString()
  return request(`/api/tickets${query ? `?${query}` : ''}`)
}

export function ingestTicket(rawText, allowAiReply = false) {
  return request('/api/tickets/ingest', {
    method: 'POST',
    body: JSON.stringify({ raw_text: rawText, allow_ai_reply: allowAiReply }),
  })
}

export function patchTicket(id, patch) {
  return request(`/api/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function sendTicket(id) {
  return request(`/api/tickets/${id}/send`, { method: 'POST' })
}

export function reanalyzeTicket(id) {
  return request(`/api/tickets/${id}/reanalyze`, { method: 'POST' })
}

export function checkLlmStatus() {
  return request('/api/llm/status')
}
