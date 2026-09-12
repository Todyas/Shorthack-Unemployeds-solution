import { useTickets } from '../../context/TicketsContext.jsx'

export default function Sidebar({ section, onSelectSection }) {
  const { tickets } = useTickets()

  return (
    <aside className="w-60 shrink-0 border-r border-ink-200 bg-white flex flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-ink-200">
        <div className="w-8 h-8 rounded-lg bg-sber-500 flex items-center justify-center text-white font-display font-bold">S</div>
        <span className="font-display font-bold text-lg">SupportPilot</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 text-sm">
        <button
          onClick={() => onSelectSection('inbox')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${section === 'inbox' ? 'bg-sber-50 text-sber-700' : ''}`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l9 6 9-6M4 6h16v12H4z" />
            </svg>
            Входящие
          </span>
          <span className="text-xs bg-sber-100 text-sber-700 rounded-full px-2 py-0.5">{tickets.length}</span>
        </button>

        <button
          onClick={() => onSelectSection('mine')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${section === 'mine' ? 'bg-sber-50 text-sber-700' : ''}`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="3.2" /><path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" />
            </svg>
            Мои заявки
          </span>
          <span className="text-xs bg-ink-100 text-ink-700 rounded-full px-2 py-0.5">8</span>
        </button>

        {[
          { key: 'all', label: 'Все заявки', path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
          { key: 'analytics', label: 'Аналитика', path: 'M4 20V10M12 20V4M20 20v-7' },
          { key: 'kb', label: 'База знаний', path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z' },
        ].map((it) => (
          <button
            key={it.key}
            onClick={() => onSelectSection(it.key)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${section === it.key ? 'bg-sber-50 text-sber-700' : ''}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={it.path} />
            </svg>
            {it.label}
          </button>
        ))}

        <button
          onClick={() => onSelectSection('api')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${section === 'api' ? 'bg-sber-50 text-sber-700' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          API / Бэкенд
        </button>
      </nav>

      <div className="p-4 border-t border-ink-200 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-ai-100 text-ai-700 flex items-center justify-center text-xs font-semibold">МК</div>
        <div className="text-sm">
          <p className="font-medium leading-none">Мария К.</p>
          <p className="text-xs text-ink-500">Оператор поддержки</p>
        </div>
      </div>
    </aside>
  )
}
