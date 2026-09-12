import TicketCard from './TicketCard.jsx'
import { statusMeta } from '../../data/constants.js'

export default function TicketColumn({ statusKey, tickets, onOpenTicket }) {
  return (
    <div className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-sm font-semibold text-ink-700">{statusMeta[statusKey].col}</h3>
        <span className="text-xs text-ink-500 bg-ink-100 rounded-full px-2 py-0.5">{tickets.length}</span>
      </div>
      <div className="space-y-3">
        {tickets.length === 0 && <p className="text-xs text-ink-500 px-1">Пусто</p>}
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onClick={() => onOpenTicket(t.id)} />
        ))}
      </div>
    </div>
  )
}
