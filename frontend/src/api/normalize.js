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

export const ACTION_TYPE_LABELS = {
  auto_reply: 'Авто-ответ по шаблону KB',
  create_ticket: 'Обычная заявка оператору',
  request_clarification: 'Нужны уточнения у пользователя',
  escalate: 'Эскалация — приоритетная заявка',
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
    system: categoryLabel.split(' → ')[1] || categoryLabel,
    // Реальное обоснование от ИИ (или от эвристики-заглушки), а не выдуманный
    // текст: раньше здесь была всегда одна и та же строка независимо от заявки.
    reasoning: raw.reasoning,
    actionType: raw.action_type,
    actionTypeLabel: ACTION_TYPE_LABELS[raw.action_type] || raw.action_type,
    missing,
    summary: raw.summary,
    original: raw.original_fragment,
    aiDraft: raw.draft_reply,
    kbTemplateId: raw.kb_template_id,
    history,
    parentMessageId: raw.parent_message_id,
  }
}
