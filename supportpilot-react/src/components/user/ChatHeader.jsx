export default function ChatHeader({ showingHistory, onToggleHistory, onNewChat }) {
  return (
    <div className="h-16 shrink-0 flex items-center gap-3 px-4 border-b border-ink-200">
      <div className="w-9 h-9 rounded-full bg-sber-500 flex items-center justify-center text-white font-display font-bold">S</div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold leading-none">Техподдержка</p>
        <p className="text-xs text-sber-600 flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sber-500" />ИИ-помощник онлайн
        </p>
      </div>
      <button
        onClick={onNewChat}
        title="Новый чат"
        className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center hover:bg-ink-100"
      >
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        onClick={onToggleHistory}
        title="Мои чаты"
        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center hover:bg-ink-100 ${showingHistory ? 'bg-sber-50 text-sber-600' : ''}`}
      >
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v5l3 2" /><circle cx="12" cy="12" r="9" />
        </svg>
      </button>
    </div>
  )
}
