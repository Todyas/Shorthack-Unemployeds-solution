import { priorityLabel, statusMeta } from '../../data/constants.js'

export default function TicketCreatedCard({ ticket }) {
  const status = statusMeta[ticket.status]

  return (
    <div className="msg-in flex justify-start">
      <div className="max-w-[85%] bg-white border border-sber-200 rounded-2xl p-3.5 text-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sber-500" />
          <span className="font-medium">Заявка №{ticket.id} создана</span>
        </div>

        <p className="text-ink-500 text-xs">
          {ticket.category} · Приоритет: {priorityLabel[ticket.priority]}
        </p>

        <p className="text-xs text-ink-700 bg-ink-50 rounded-lg px-2.5 py-2 leading-relaxed">
          «{ticket.original}»
        </p>

        {ticket.missing && ticket.missing.length > 0 && (
          <div>
            <p className="text-xs text-ink-500 mb-1">Оператор уточнит у вас:</p>
            <ul className="space-y-0.5">
              {ticket.missing.map((m, i) => (
                <li key={i} className="text-xs text-rose-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />{m}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-ink-500 pt-1.5 border-t border-ink-100">
          {ticket.kbTemplateId
            ? 'Найден рекомендованный шаблон ответа — ожидает проверки оператором.'
            : 'Передано оператору для ручной обработки.'}
          {' '}Статус: {status ? status.label : ticket.status}.
        </p>
      </div>
    </div>
  )
}
