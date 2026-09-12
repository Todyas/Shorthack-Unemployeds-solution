import { priorityBar, priorityLabel, priorityStyle } from '../../data/constants.js'

export default function TicketCard({ ticket, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left bg-white border border-ink-200/70 rounded-2xl pl-4 pr-3.5 py-3.5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBar[ticket.priority]}`} />
      <p className="text-sm font-medium mb-2 leading-snug text-ink-900">{ticket.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-600 border border-ink-100">
          {ticket.category.split(' → ')[0]}
        </span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityStyle[ticket.priority]}`}>
          {priorityLabel[ticket.priority]}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-ink-400">
        <span>#{ticket.id}</span>
        <span>{ticket.createdAt.split(',')[0]}</span>
      </div>
    </button>
  )
}
