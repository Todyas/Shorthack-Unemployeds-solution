import { useEffect, useRef, useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import { chatTree, ticketCreationNodes } from '../../data/chatTree.js'
import ChatHeader from './ChatHeader.jsx'
import ChatMessages from './ChatMessages.jsx'
import ChatComposer from './ChatComposer.jsx'
import ChatSessionsPanel from './ChatSessionsPanel.jsx'

const DEFAULT_TITLE = 'Новый чат'

function truncateTitle(text) {
  return text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text
}

export default function UserApp() {
  const { addTicket } = useTickets()
  const [sessions, setSessions] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const idRef = useRef(0)
  const startedRef = useRef(false)

  function nextId() {
    idRef.current += 1
    return idRef.current
  }

  function updateSessionMessages(sessionId, updater) {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, messages: updater(s.messages) } : s)))
  }

  function pushBubble(sessionId, author, text) {
    updateSessionMessages(sessionId, (prev) => [...prev, { id: nextId(), kind: 'bubble', author, text }])
    if (author === 'user') {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId && s.title === DEFAULT_TITLE ? { ...s, title: truncateTitle(text) } : s)),
      )
    }
  }
  function pushOptions(sessionId, options) {
    updateSessionMessages(sessionId, (prev) => [...prev, { id: nextId(), kind: 'options', options }])
  }
  function pushTicket(sessionId, ticket) {
    updateSessionMessages(sessionId, (prev) => [...prev, { id: nextId(), kind: 'ticket', ticket }])
  }
  function removeMessage(sessionId, messageId) {
    updateSessionMessages(sessionId, (prev) => prev.filter((m) => m.id !== messageId))
  }

  // Заявка всегда уходит оператору на проверку: ИИ только определяет
  // категорию/приоритет и готовит рекомендованный ответ для оператора,
  // но никогда не отвечает пользователю от своего имени.
  async function createTicketsFromText(sessionId, rawText, botReplyText) {
    try {
      const created = await addTicket({ rawText })
      const introText = created.length > 1
        ? `Обращение разбито на ${created.length} заявки, все переданы оператору.`
        : botReplyText || 'Спасибо! Ваше обращение зарегистрировано и передано оператору.'
      pushBubble(sessionId, 'bot', introText)
      created.forEach((t) => pushTicket(sessionId, t))
    } catch (e) {
      pushBubble(sessionId, 'bot', 'Не удалось оформить заявку, попробуйте ещё раз чуть позже.')
    }
  }

  function goToNode(sessionId, key) {
    // Узел создания заявки по сценарию — отправляем описание в бэкенд
    if (ticketCreationNodes[key]) {
      const data = ticketCreationNodes[key]
      const rawText = data.summary
      setTimeout(async () => {
        await createTicketsFromText(sessionId, rawText, data.botReply)
        finishFlow(sessionId)
      }, 400)
      return
    }

    const node = chatTree[key]
    if (!node) return
    setTimeout(() => {
      pushBubble(sessionId, 'bot', node.text)
      if (node.options && node.options.length) pushOptions(sessionId, node.options)
    }, 350)
  }

  function finishFlow(sessionId) {
    setTimeout(() => {
      pushBubble(sessionId, 'bot', 'Могу ещё чем-то помочь? Опишите проблему в любой момент — я оформлю заявку.')
    }, 900)
  }

  function handleSelectOption(sessionId, optionsMessageId, opt) {
    removeMessage(sessionId, optionsMessageId)
    pushBubble(sessionId, 'user', opt.label)
    goToNode(sessionId, opt.next)
  }

  // Свободный текст всегда уходит на декомпозицию бэкендом, независимо от
  // того, на каком шаге сценария сейчас находится пользователь.
  function handleSend(sessionId, text) {
    pushBubble(sessionId, 'user', text)
    setTimeout(async () => {
      await createTicketsFromText(sessionId, text)
      finishFlow(sessionId)
    }, 400)
  }

  function createSession() {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(nextId())
    const session = { id, title: DEFAULT_TITLE, createdAt: new Date(), messages: [] }
    setSessions((prev) => [session, ...prev])
    setActiveId(id)
    setShowHistory(false)
    goToNode(id, 'root')
    return id
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    createSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeSession = sessions.find((s) => s.id === activeId)

  return (
    <div className="min-h-screen flex items-stretch justify-center sm:py-8 sm:px-4" style={{ background: '#EEF3EE' }}>
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl sm:shadow-card flex flex-col h-screen sm:h-[720px] overflow-hidden">
        <ChatHeader
          showingHistory={showHistory}
          onToggleHistory={() => setShowHistory((v) => !v)}
          onNewChat={createSession}
        />
        {showHistory ? (
          <ChatSessionsPanel
            sessions={sessions}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id)
              setShowHistory(false)
            }}
          />
        ) : (
          <>
            <ChatMessages
              messages={activeSession ? activeSession.messages : []}
              onSelectOption={(msgId, opt) => handleSelectOption(activeId, msgId, opt)}
            />
            <ChatComposer onSend={(text) => handleSend(activeId, text)} />
          </>
        )}
      </div>
    </div>
  )
}
