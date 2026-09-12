import { useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import { statusMeta } from '../../data/constants.js'
import AiAnalysisTab from './tabs/AiAnalysisTab.jsx'
import RawTextTab from './tabs/RawTextTab.jsx'
import HistoryTab from './tabs/HistoryTab.jsx'
import ReplyComposer from './ReplyComposer.jsx'

const tabs = [
  { key: 'ai', label: 'Анализ ИИ' },
  { key: 'raw', label: 'Исходное обращение' },
  { key: 'history', label: 'История' },
]

export default function TicketDetail({ ticketId, onBack, onOpenTicket }) {
  const { tickets } = useTickets()
  const [activeTab, setActiveTab] = useState('ai')
  const ticket = tickets.find((t) => t.id === ticketId)

  if (!ticket) return null
  const meta = statusMeta[ticket.status]

  return (
    <section>
      <header className="h-16 border-b border-ink-200/70 bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-ink-100 shrink-0 text-ink-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg tracking-tight truncate">{ticket.title}</h1>
            <p className="text-xs text-ink-400">#{ticket.id} · {ticket.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${meta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
      </header>

      <div className="px-6 pt-4 border-b border-ink-200/70 bg-white flex gap-6 text-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === t.key ? 'text-sber-600 border-sber-500' : 'text-ink-400 border-transparent hover:text-ink-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5 max-w-5xl">
        {activeTab === 'ai' && <AiAnalysisTab ticket={ticket} onOpenTicket={onOpenTicket} />}
        {activeTab === 'raw' && <RawTextTab ticket={ticket} />}
        {activeTab === 'history' && <HistoryTab ticket={ticket} />}
        <ReplyComposer ticket={ticket} onDone={onBack} />
      </div>
    </section>
  )
}
