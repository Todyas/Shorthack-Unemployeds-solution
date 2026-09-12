const authorMeta = {
  ai: { badge: 'ИИ', cls: 'bg-ai-100 text-ai-700' },
  operator: { badge: 'ОП', cls: 'bg-sber-100 text-sber-700' },
  user: { badge: 'П', cls: 'bg-ink-100 text-ink-700' },
}

export default function HistoryTab({ ticket }) {
  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-6">
      <ol className="space-y-4 text-sm">
        {ticket.history.map((h, i) => {
          const meta = authorMeta[h.author] || authorMeta.user
          return (
            <li key={i} className="flex gap-3">
              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold ${meta.cls}`}>
                {meta.badge}
              </div>
              <div>
                <p className="text-sm">{h.text}</p>
                <p className="text-xs text-ink-500 mt-0.5">{h.time}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
