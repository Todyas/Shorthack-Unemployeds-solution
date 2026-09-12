import { priorityLabel } from '../../data/constants.js'

export default function TicketCreatedCard({ ticket }) {
  return (
    <div className="msg-in flex justify-start">
      <div className="max-w-[85%] bg-white border border-sber-200 rounded-2xl p-3.5 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-sber-500" />
          <span className="font-medium">Заявка №{ticket.id} создана</span>
        </div>
        <p className="text-ink-500 text-xs">
          {ticket.category} · Приоритет: {priorityLabel[ticket.priority]}
        </p>
      </div>
    </div>
  )
}
