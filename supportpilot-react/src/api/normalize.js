// Приводит тикет из бэкенда (app/models.py) к форме, которую уже ожидают
// компоненты интерфейса (изначально написанные под src/data/tickets.js).
const CATEGORY_LABELS = {
  wifi: 'Инфраструктура → Wi-Fi',
  vpn: 'Инфраструктура → VPN',
  access_control: 'Безопасность → СКУД',
  personal_cabinet: 'Учётная запись → Личный кабинет',
  password_reset: 'Учётная запись → Сброс пароля',
  hr: 'Кадры → HR',
  other: 'Другое',
}

function formatDateTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ru-RU').slice(0, 17)
}

function formatTime(iso) {
  const formatted = formatDateTime(iso)
  return formatted ? formatted.slice(-5) : ''
}

export function normalizeTicket(raw) {
  const categoryLabel = CATEGORY_LABELS[raw.category] || raw.category
  const missing = raw.missing_info || []

  const history = []
  if (raw.original_fragment) {
    history.push({ author: 'user', text: raw.original_fragment, time: formatTime(raw.created_at) })
  }
  if (raw.draft_reply) {
    history.push({ author: 'ai', text: raw.draft_reply, time: formatTime(raw.updated_at) })
  }
  if (raw.status === 'resolved' && raw.sent_at) {
    history.push({ author: 'operator', text: 'Заявка отправлена пользователю', time: formatTime(raw.sent_at) })
  }

  return {
    id: raw.id,
    title: raw.summary,
    status: raw.status,
    createdAt: formatDateTime(raw.created_at),
    userName: 'Пользователь чата',
    userDept: '—',
    category: categoryLabel,
    priority: raw.priority,
    confidence: raw.kb_template_id ? 92 : 78,
    system: categoryLabel.split(' → ')[1] || categoryLabel,
    cause: raw.requires_clarification
      ? 'Недостаточно данных, требуется уточнение у пользователя'
      : 'Определено автоматически на основе текста обращения',
    problems: [raw.summary],
    missing,
    summary: raw.summary,
    original: raw.original_fragment,
    aiDraft: raw.draft_reply,
    kbTemplateId: raw.kb_template_id,
    history,
    parentMessageId: raw.parent_message_id,
  }
}
