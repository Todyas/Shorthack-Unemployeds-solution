import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  fetchTickets,
  ingestTicket,
  patchTicket,
  reanalyzeTicket as apiReanalyzeTicket,
  sendTicket as apiSendTicket,
} from '../api/client.js'
import { normalizeTicket } from '../api/normalize.js'

const TicketsContext = createContext(null)

export function TicketsProvider({ children }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchTickets()
      setTickets(data.map(normalizeTicket))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Отправляет сырой текст обращения в /api/tickets/ingest, обновляет список
  // и возвращает только те заявки, которые были созданы этим вызовом
  // (LLM может декомпозировать одно сообщение на несколько заявок).
  // allowAiReply всегда false по умолчанию: оператор должен проверить
  // каждую заявку, ИИ не отвечает пользователю автоматически.
  async function addTicket({ rawText, allowAiReply = false }) {
    const result = await ingestTicket(rawText, allowAiReply)
    const data = await fetchTickets()
    const normalized = data.map(normalizeTicket)
    setTickets(normalized)
    const createdIds = new Set(result.created_tickets.map((t) => t.id))
    return normalized.filter((t) => createdIds.has(t.id))
  }

  async function updateTicket(id, patch) {
    const updated = await patchTicket(id, patch)
    const normalized = normalizeTicket(updated)
    setTickets((prev) => prev.map((t) => (t.id === id ? normalized : t)))
    return normalized
  }

  async function sendTicket(id) {
    const updated = await apiSendTicket(id)
    const normalized = normalizeTicket(updated)
    setTickets((prev) => prev.map((t) => (t.id === id ? normalized : t)))
    return normalized
  }

  async function reanalyzeTicket(id) {
    const updated = await apiReanalyzeTicket(id)
    const normalized = normalizeTicket(updated)
    setTickets((prev) => prev.map((t) => (t.id === id ? normalized : t)))
    return normalized
  }

  return (
    <TicketsContext.Provider
      value={{ tickets, loading, error, refresh, addTicket, updateTicket, sendTicket, reanalyzeTicket }}
    >
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error('useTickets должен использоваться внутри <TicketsProvider>')
  return ctx
}
