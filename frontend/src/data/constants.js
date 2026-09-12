export const priorityStyle = {
  low: 'bg-ink-100 text-ink-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-rose-50 text-rose-700',
}

// Левая полоска-акцент на карточках заявок — быстрый визуальный сигнал
// приоритета без необходимости читать бейдж.
export const priorityBar = {
  low: 'bg-ink-300',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  urgent: 'bg-rose-500',
}

export const priorityLabel = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочно',
}

export const statusMeta = {
  new:         { label: 'Новая',             col: 'Новые',             pill: 'bg-ink-100 text-ink-600',   dot: 'bg-ink-400' },
  clarify:     { label: 'Требует уточнения', col: 'Требует уточнения', pill: 'bg-ai-100 text-ai-700',     dot: 'bg-ai-500' },
  in_progress: { label: 'В работе',          col: 'В работе',          pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  resolved:    { label: 'Решено',            col: 'Решено',            pill: 'bg-sber-100 text-sber-700', dot: 'bg-sber-500' },
}
