import { createContext, useContext, useRef, useState } from 'react'
import { initialTickets } from '../data/tickets.js'

const TicketsContext = createContext(null)

export function TicketsProvider({ children }) {
  const [tickets, setTickets] = useState(initialTickets)
  const seqRef = useRef(1843) // следующий id новой заявки

  // Добавляет новую заявку (используется чат-ботом) и возвращает её
  function addTicket({ category, priority, title, summary }) {
    const ticket = {
      id: seqRef.current++,
      title,
      status: 'new',
      createdAt: new Date().toLocaleString('ru-RU').slice(0, 17),
      userName: 'Пользователь чата',
      userDept: '—',
      category,
      priority,
      confidence: 80 + Math.floor(Math.random() * 15),
      system: category.split(' → ')[1] || category,
      cause: 'Определяется оператором',
      problems: [title],
      missing: ['Подтверждение оператора'],
      summary,
      original: summary,
      aiDraft: 'Спасибо за обращение! Мы уже работаем над решением, ориентировочное время ответа — до 2 часов.',
      history: [
        { author: 'user', text: summary, time: 'сейчас' },
        { author: 'ai', text: 'Заявка автоматически создана из чата и передана оператору.', time: 'сейчас' },
      ],
    }
    setTickets((prev) => [ticket, ...prev])
    return ticket
  }

  function updateTicket(id, patch) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  return (
    <TicketsContext.Provider value={{ tickets, addTicket, updateTicket }}>
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error('useTickets должен использоваться внутри <TicketsProvider>')
  return ctx
}
