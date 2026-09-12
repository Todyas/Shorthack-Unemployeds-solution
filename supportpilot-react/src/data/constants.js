export const priorityStyle = {
  low: 'bg-ink-100 text-ink-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
}

export const priorityLabel = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const statusMeta = {
  new:         { label: 'Новая',             col: 'Новые',             pill: 'bg-ink-100 text-ink-700' },
  clarify:     { label: 'Требует уточнения', col: 'Требует уточнения', pill: 'bg-ai-100 text-ai-700' },
  in_progress: { label: 'В работе',          col: 'В работе',          pill: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Решено',            col: 'Решено',            pill: 'bg-sber-100 text-sber-700' },
}
