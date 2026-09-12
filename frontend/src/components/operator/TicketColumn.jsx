import TicketCard from './TicketCard.jsx'
import { statusMeta } from '../../data/constants.js'

export default function TicketColumn({ statusKey, tickets, onOpenTicket }) {
  const meta = statusMeta[statusKey]
  return (
    <div className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center gap-2 px-1 mb-3">
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        <h3 className="text-sm font-semibold text-ink-700">{meta.col}</h3>
        <span className="text-xs text-ink-400 ml-auto">{tickets.length}</span>
      </div>
      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl">
            <p className="text-xs text-ink-400">Пусто</p>
          </div>
        )}
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onClick={() => onOpenTicket(t.id)} />
        ))}
      </div>
    </div>
  )
}
