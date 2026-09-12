function formatSessionDate(date) {
  return date.toLocaleString('ru-RU').slice(0, 17)
}

export default function ChatSessionsPanel({ sessions, activeId, onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-ink-50/40">
      <p className="eyebrow mb-2.5">Ваши чаты</p>
      {sessions.length === 0 && <p className="text-sm text-ink-400">Пока нет ни одного чата.</p>}
      <div className="space-y-2">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-3.5 py-3 rounded-2xl border transition-colors ${
              s.id === activeId ? 'border-sber-200 bg-sber-50' : 'border-ink-200 bg-white hover:bg-ink-50'
            }`}
          >
            <p className="text-sm font-medium truncate text-ink-900">{s.title}</p>
            <p className="text-xs text-ink-400 mt-0.5">
              {formatSessionDate(s.createdAt)} · {s.messages.length} сообщени{s.messages.length === 1 ? 'е' : 'й'}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
