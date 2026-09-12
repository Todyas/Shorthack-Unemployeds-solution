import { useTickets } from '../../context/TicketsContext.jsx'

const NAV_ICONS = {
  inbox: 'M3 8l9 6 9-6M4 6h16v12H4z',
  mine: 'M12 8v0',
  all: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  analytics: 'M4 20V10M12 20V4M20 20v-7',
  kb: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z',
  api: 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3',
}

function NavItem({ active, onClick, icon, label, count, countTone = 'default' }) {
  const countCls =
    countTone === 'accent'
      ? 'bg-ai-100 text-ai-700'
      : active
        ? 'bg-sber-100 text-sber-700'
        : 'bg-ink-100 text-ink-500'

  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center justify-between pl-4 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-sber-50 text-sber-700' : 'text-ink-600 hover:bg-ink-50'
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-sber-500" />}
      <span className="flex items-center gap-2.5">
        {icon === 'mine' ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="3.2" /><path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={NAV_ICONS[icon]} />
          </svg>
        )}
        {label}
      </span>
      {count != null && <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${countCls}`}>{count}</span>}
    </button>
  )
}

export default function Sidebar({ section, onSelectSection }) {
  const { tickets } = useTickets()

  const inboxCount = tickets.filter((t) => t.status === 'new' || t.status === 'clarify').length
  const mineCount = tickets.filter((t) => t.status === 'in_progress').length

  return (
    <aside className="w-64 shrink-0 border-r border-ink-200/70 bg-white flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-ink-200/70">
        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white font-display font-bold shrink-0">T</div>
        <span className="font-display font-bold text-lg tracking-tight">TicketHelp</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 text-sm">
        <p className="eyebrow px-4 mb-1.5">Заявки</p>
        <NavItem
          active={section === 'inbox'}
          onClick={() => onSelectSection('inbox')}
          icon="inbox"
          label="Входящие"
          count={inboxCount}
        />
        <NavItem
          active={section === 'mine'}
          onClick={() => onSelectSection('mine')}
          icon="mine"
          label="Мои заявки"
          count={mineCount}
        />
        <NavItem
          active={section === 'all'}
          onClick={() => onSelectSection('all')}
          icon="all"
          label="Все заявки"
          count={tickets.length}
        />

        <p className="eyebrow px-4 mb-1.5 mt-5">Инструменты</p>
        <NavItem active={section === 'analytics'} onClick={() => onSelectSection('analytics')} icon="analytics" label="Аналитика" />
        <NavItem active={section === 'kb'} onClick={() => onSelectSection('kb')} icon="kb" label="База знаний" />
        <NavItem active={section === 'api'} onClick={() => onSelectSection('api')} icon="api" label="API / Бэкенд" />
      </nav>

      <div className="p-4 border-t border-ink-200/70 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-ai-100 text-ai-700 flex items-center justify-center text-xs font-semibold shrink-0">МК</div>
        <div className="text-sm min-w-0">
          <p className="font-medium leading-none truncate">Мария К.</p>
          <p className="text-xs text-ink-400 mt-0.5">Оператор поддержки</p>
        </div>
      </div>
    </aside>
  )
}
