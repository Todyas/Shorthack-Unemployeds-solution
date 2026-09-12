function formatSessionDate(date) {
  return date.toLocaleString('ru-RU').slice(0, 17)
}

export default function ChatSessionsPanel({ sessions, activeId, onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <p className="text-xs text-ink-500 mb-2">Ваши чаты</p>
      {sessions.length === 0 && <p className="text-sm text-ink-500">Пока нет ни одного чата.</p>}
      <div className="space-y-1.5">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
              s.id === activeId ? 'border-sber-300 bg-sber-50' : 'border-ink-200 hover:bg-ink-50'
            }`}
          >
            <p className="text-sm font-medium truncate">{s.title}</p>
            <p className="text-xs text-ink-500">
              {formatSessionDate(s.createdAt)} · {s.messages.length} сообщени{s.messages.length === 1 ? 'е' : 'й'}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
