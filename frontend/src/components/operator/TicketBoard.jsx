import { useMemo, useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import TicketColumn from './TicketColumn.jsx'

const ALL_COLUMNS = ['new', 'clarify', 'in_progress', 'resolved']

const TITLES = {
  inbox: 'Входящие',
  mine: 'Мои заявки',
  all: 'Все заявки',
}

export default function TicketBoard({ section = 'all', onOpenTicket }) {
  const { tickets, loading, error, refresh } = useTickets()
  const [query, setQuery] = useState('')

  const columns = section === 'inbox' ? ['new', 'clarify'] : section === 'mine' ? ['in_progress'] : ALL_COLUMNS

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter((t) =>
      [t.title, t.summary, t.category, String(t.id)].some((field) => (field || '').toLowerCase().includes(q)),
    )
  }, [tickets, query])

  return (
    <section>
      <header className="h-16 border-b border-ink-200/70 bg-white flex items-center justify-between px-6">
        <h1 className="font-display font-bold text-xl tracking-tight">{TITLES[section] || 'Заявки'}</h1>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заявкам"
            className="pl-10 pr-3 py-2 text-sm rounded-full border border-ink-200 bg-ink-50 w-64 focus:bg-white transition-colors"
          />
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 text-sm bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3">
          <span>Не удалось загрузить заявки с сервера: {error}</span>
          <button onClick={refresh} className="font-medium underline shrink-0">Повторить</button>
        </div>
      )}

      {loading && !error ? (
        <p className="px-6 pt-6 text-sm text-ink-500">Загрузка заявок...</p>
      ) : (
        <div className="p-6 flex gap-5 overflow-x-auto items-start">
          {columns.map((key) => (
            <TicketColumn
              key={key}
              statusKey={key}
              tickets={filtered.filter((t) => t.status === key)}
              onOpenTicket={onOpenTicket}
            />
          ))}
        </div>
      )}
    </section>
  )
}
