const authorMeta = {
  ai: { badge: 'ИИ', cls: 'bg-ai-100 text-ai-700' },
  operator: { badge: 'ОП', cls: 'bg-sber-100 text-sber-700' },
  user: { badge: 'П', cls: 'bg-ink-100 text-ink-600' },
}

export default function HistoryTab({ ticket }) {
  return (
    <div className="surface p-6">
      <ol className="relative space-y-5 before:absolute before:left-3 before:top-1 before:bottom-1 before:w-px before:bg-ink-200">
        {ticket.history.map((h, i) => {
          const meta = authorMeta[h.author] || authorMeta.user
          return (
            <li key={i} className="relative flex gap-3.5 pl-0">
              <div className={`relative z-10 w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold ${meta.cls}`}>
                {meta.badge}
              </div>
              <div>
                <p className="text-sm text-ink-800">{h.text}</p>
                <p className="text-xs text-ink-400 mt-0.5">{h.time}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
