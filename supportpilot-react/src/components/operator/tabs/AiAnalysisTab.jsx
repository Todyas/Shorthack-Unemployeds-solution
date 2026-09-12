import { useState } from 'react'
import { useTickets } from '../../../context/TicketsContext.jsx'
import { priorityStyle, priorityLabel } from '../../../data/constants.js'

export default function AiAnalysisTab({ ticket, onOpenTicket }) {
  const { tickets, reanalyzeTicket } = useTickets()
  const [reanalyzing, setReanalyzing] = useState(false)
  const [error, setError] = useState(null)

  const siblings = tickets.filter((t) => t.id !== ticket.id && t.parentMessageId && t.parentMessageId === ticket.parentMessageId)

  async function handleReanalyze() {
    setReanalyzing(true)
    setError(null)
    try {
      await reanalyzeTicket(ticket.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setReanalyzing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white border border-ink-200 rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-3">Текст обращения</h3>
        <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{ticket.original}</p>
        <div className="mt-4 pt-4 border-t border-ink-100 text-xs text-ink-500">
          {ticket.userName} · {ticket.userDept}
        </div>

        {siblings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ink-100">
            <p className="text-xs text-ink-500 mb-2">
              Из этого же обращения создано ещё {siblings.length} {siblings.length === 1 ? 'заявка' : 'заявки'}:
            </p>
            <div className="space-y-1.5">
              {siblings.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onOpenTicket && onOpenTicket(s.id)}
                  disabled={!onOpenTicket}
                  className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-ink-50 hover:bg-ink-100 disabled:cursor-default disabled:hover:bg-ink-50"
                >
                  <span className="text-ink-500">#{s.id}</span> {s.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-ink-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-ai-100 text-ai-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8z" />
              </svg>
            </span>
            Анализ ИИ
          </h3>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="text-xs text-ai-600 font-medium flex items-center gap-1 hover:text-ai-700 disabled:opacity-60"
          >
            <svg className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 4v5h-5" />
            </svg>
            {reanalyzing ? 'Анализируем...' : 'Перезапустить анализ'}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-ink-500 text-xs mb-1">Краткая суть</p>
            <p className="text-ink-900">{ticket.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-ink-500 text-xs mb-1">Категория</p>
              <p className="font-medium">{ticket.category}</p>
            </div>
            <div>
              <p className="text-ink-500 text-xs mb-1">Приоритет</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyle[ticket.priority]}`}>
                {priorityLabel[ticket.priority]}
              </span>
            </div>
            <div>
              <p className="text-ink-500 text-xs mb-1">Решение ИИ</p>
              <p className="font-medium">{ticket.actionTypeLabel}</p>
            </div>
            <div>
              <p className="text-ink-500 text-xs mb-1">Шаблон базы знаний</p>
              <p className="font-medium">{ticket.kbTemplateId || 'не найден'}</p>
            </div>
          </div>

          <div>
            <p className="text-ink-500 text-xs mb-1">Обоснование ИИ</p>
            <p>{ticket.reasoning || 'ИИ не указал обоснование для этой заявки.'}</p>
          </div>

          <div>
            <p className="text-ink-500 text-xs mb-1">Недостающая информация</p>
            <ul className="space-y-1">
              {ticket.missing.length === 0 && (
                <li className="text-sber-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sber-500" />Вся информация есть
                </li>
              )}
              {ticket.missing.map((m, i) => (
                <li key={i} className="flex items-center gap-2 text-rose-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />{m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
