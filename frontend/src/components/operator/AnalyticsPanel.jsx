import { useMemo } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import { priorityLabel, statusMeta } from '../../data/constants.js'

function Bar({ label, count, total, tone = 'bg-sber-500' }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-ink-700">{label}</span>
        <span className="text-ink-400 text-xs">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AnalyticsPanel() {
  const { tickets } = useTickets()

  const stats = useMemo(() => {
    const total = tickets.length
    const byStatus = {}
    const byPriority = {}
    const byCategory = {}
    let autoResolved = 0
    let needsClarification = 0

    for (const t of tickets) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
      const cat = (t.category || 'Другое').split(' → ')[0]
      byCategory[cat] = (byCategory[cat] || 0) + 1
      if (t.status === 'resolved' && t.actionType === 'auto_reply') autoResolved += 1
      if (t.status === 'clarify') needsClarification += 1
    }

    return { total, byStatus, byPriority, byCategory, autoResolved, needsClarification }
  }, [tickets])

  const topCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])

  return (
    <section>
      <header className="h-16 border-b border-ink-200/70 bg-white flex items-center px-6">
        <h1 className="font-display font-bold text-xl tracking-tight">Аналитика</h1>
      </header>

      <div className="p-6 space-y-5 max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Всего заявок', value: stats.total, tone: 'text-ink-900' },
            { label: 'Требуют уточнения', value: stats.needsClarification, tone: 'text-ai-600' },
            { label: 'Решено ИИ автоматически', value: stats.autoResolved, tone: 'text-sber-600' },
            { label: 'В работе у оператора', value: stats.byStatus.in_progress || 0, tone: 'text-amber-600' },
          ].map((card) => (
            <div key={card.label} className="surface p-4">
              <p className={`font-display text-2xl font-bold ${card.tone}`}>{card.value}</p>
              <p className="text-xs text-ink-500 mt-1 leading-snug">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="surface p-5">
          <h3 className="font-display font-semibold text-sm mb-4">По статусу</h3>
          <div className="space-y-3">
            {Object.keys(statusMeta).map((key) => (
              <Bar key={key} label={statusMeta[key].label} count={stats.byStatus[key] || 0} total={stats.total} tone="bg-sber-500" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="surface p-5">
            <h3 className="font-display font-semibold text-sm mb-4">По приоритету</h3>
            <div className="space-y-3">
              {['urgent', 'high', 'medium', 'low'].map((key) => (
                <Bar key={key} label={priorityLabel[key]} count={stats.byPriority[key] || 0} total={stats.total} tone="bg-ai-500" />
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <h3 className="font-display font-semibold text-sm mb-4">По категориям</h3>
            {topCategories.length === 0 && <p className="text-sm text-ink-400">Пока нет данных</p>}
            <div className="space-y-3">
              {topCategories.map(([label, count]) => (
                <Bar key={label} label={label} count={count} total={stats.total} tone="bg-ink-500" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
