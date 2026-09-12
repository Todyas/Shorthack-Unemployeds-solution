import { priorityStyle, priorityLabel } from '../../data/constants.js'

export default function TicketCard({ ticket, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-ink-200 rounded-xl p-4 shadow-card hover:border-sber-400"
    >
      <p className="text-sm font-medium mb-2 leading-snug">{ticket.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-ai-50 text-ai-700">
          {ticket.category.split(' → ')[0]}
        </span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityStyle[ticket.priority]}`}>
          {priorityLabel[ticket.priority]}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>#{ticket.id}</span>
        <span>{ticket.createdAt.split(',')[0]}</span>
      </div>
    </button>
  )
}
