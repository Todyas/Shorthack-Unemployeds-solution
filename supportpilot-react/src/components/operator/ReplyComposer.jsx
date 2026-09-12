import { useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'

export default function ReplyComposer({ ticket, onDone }) {
  const { updateTicket, sendTicket } = useTickets()
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSendAndResolve() {
    setSubmitting(true)
    setError(null)
    try {
      if (reply.trim()) {
        await updateTicket(ticket.id, { draft_reply: reply.trim() })
      }
      await sendTicket(ticket.id)
      onDone && onDone()
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  async function handleRequestClarification() {
    setSubmitting(true)
    setError(null)
    try {
      await updateTicket(ticket.id, { status: 'clarify', draft_reply: reply.trim() || undefined })
      onDone && onDone()
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  async function handleHandoverToTeam() {
    setSubmitting(true)
    setError(null)
    try {
      await updateTicket(ticket.id, { status: 'in_progress' })
      onDone && onDone()
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-sm">Ответ пользователю</h3>
        <button
          onClick={() => setReply(ticket.aiDraft)}
          disabled={!ticket.aiDraft}
          className="text-xs text-ai-600 font-medium hover:text-ai-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-ai-600"
        >
          {ticket.aiDraft ? 'Вставить рекомендованный ответ' : 'Нет рекомендации от ИИ'}
        </button>
      </div>
      {ticket.aiDraft && (
        <div className="mb-3 p-3 rounded-xl bg-ai-50 border border-ai-100 text-xs text-ink-700">
          <p className="text-ai-700 font-medium mb-1">Рекомендованный ответ ИИ (требует проверки)</p>
          <p className="leading-relaxed">{ticket.aiDraft}</p>
        </div>
      )}
      <textarea
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Напишите ответ пользователю..."
        className="w-full text-sm border border-ink-200 rounded-xl p-3 bg-ink-50 resize-none"
      />
      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mt-3">
          Не удалось выполнить действие: {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={handleSendAndResolve}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-sber-500 text-white hover:bg-sber-600 disabled:opacity-60"
        >
          {submitting ? 'Отправляем...' : 'Отправить и принять заявку'}
        </button>
        <button
          onClick={handleRequestClarification}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-60"
        >
          Запросить уточнение
        </button>
        <button
          onClick={handleHandoverToTeam}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-60"
        >
          Передать команде
        </button>
      </div>
    </div>
  )
}
