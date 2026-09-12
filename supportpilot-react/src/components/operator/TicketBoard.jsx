import { useTickets } from '../../context/TicketsContext.jsx'
import TicketColumn from './TicketColumn.jsx'

const columns = ['new', 'clarify', 'in_progress', 'resolved']

export default function TicketBoard({ onOpenTicket }) {
  const { tickets, loading, error, refresh } = useTickets()

  return (
    <section>
      <header className="h-16 border-b border-ink-200 bg-white flex items-center justify-between px-6">
        <h1 className="font-display font-bold text-xl">Все заявки</h1>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-2.5 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input placeholder="Поиск по заявкам" className="pl-9 pr-3 py-2 text-sm rounded-lg border border-ink-200 bg-ink-50 w-64" />
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3">
          <span>Не удалось загрузить заявки с сервера: {error}</span>
          <button onClick={refresh} className="font-medium underline shrink-0">Повторить</button>
        </div>
      )}

      {loading && !error ? (
        <p className="px-6 pt-6 text-sm text-ink-500">Загрузка заявок...</p>
      ) : (
        <div className="p-6 flex gap-4 overflow-x-auto">
          {columns.map((key) => (
            <TicketColumn
              key={key}
              statusKey={key}
              tickets={tickets.filter((t) => t.status === key)}
              onOpenTicket={onOpenTicket}
            />
          ))}
        </div>
      )}
    </section>
  )
}
