import { useEffect, useRef, useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import { chatTree, ticketCreationNodes } from '../../data/chatTree.js'
import ChatHeader from './ChatHeader.jsx'
import ChatMessages from './ChatMessages.jsx'
import ChatComposer from './ChatComposer.jsx'

export default function UserApp() {
  const { addTicket } = useTickets()
  const [messages, setMessages] = useState([])
  const idRef = useRef(0)
  const startedRef = useRef(false)

  function nextId() {
    idRef.current += 1
    return idRef.current
  }

  function pushBubble(author, text) {
    setMessages((prev) => [...prev, { id: nextId(), kind: 'bubble', author, text }])
  }
  function pushOptions(options) {
    setMessages((prev) => [...prev, { id: nextId(), kind: 'options', options }])
  }
  function pushTicket(ticket) {
    setMessages((prev) => [...prev, { id: nextId(), kind: 'ticket', ticket }])
  }
  function removeMessage(id) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  // Заявка всегда уходит оператору на проверку: ИИ только определяет
  // категорию/приоритет и готовит рекомендованный ответ для оператора,
  // но никогда не отвечает пользователю от своего имени.
  async function createTicketsFromText(rawText, botReplyText) {
    try {
      const created = await addTicket({ rawText })
      const introText = created.length > 1
        ? `Обращение разбито на ${created.length} заявки, все переданы оператору.`
        : botReplyText || 'Спасибо! Ваше обращение зарегистрировано и передано оператору.'
      pushBubble('bot', introText)
      created.forEach(pushTicket)
    } catch (e) {
      pushBubble('bot', 'Не удалось оформить заявку, попробуйте ещё раз чуть позже.')
    }
  }

  function goToNode(key) {
    // Узел создания заявки по сценарию — отправляем описание в бэкенд
    if (ticketCreationNodes[key]) {
      const data = ticketCreationNodes[key]
      // summary уже самодостаточное описание проблемы — не добавляем title
      // отдельным предложением, иначе декомпозитор режет его на два тикета.
      const rawText = data.summary
      setTimeout(async () => {
        await createTicketsFromText(rawText, data.botReply)
        finishFlow()
      }, 400)
      return
    }

    const node = chatTree[key]
    if (!node) return
    setTimeout(() => {
      pushBubble('bot', node.text)
      if (node.options && node.options.length) pushOptions(node.options)
    }, 350)
  }

  function finishFlow() {
    setTimeout(() => {
      pushBubble('bot', 'Могу ещё чем-то помочь? Опишите проблему в любой момент — я оформлю заявку.')
    }, 900)
  }

  function handleSelectOption(optionsMessageId, opt) {
    removeMessage(optionsMessageId)
    pushBubble('user', opt.label)
    goToNode(opt.next)
  }

  // Свободный текст всегда уходит на декомпозицию бэкендом, независимо от
  // того, на каком шаге сценария сейчас находится пользователь.
  function handleSend(text) {
    pushBubble('user', text)
    setTimeout(async () => {
      await createTicketsFromText(text)
      finishFlow()
    }, 400)
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    goToNode('root')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-stretch justify-center sm:py-8 sm:px-4" style={{ background: '#EEF3EE' }}>
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl sm:shadow-card flex flex-col h-screen sm:h-[720px] overflow-hidden">
        <ChatHeader />
        <ChatMessages messages={messages} onSelectOption={handleSelectOption} />
        <ChatComposer onSend={handleSend} />
      </div>
    </div>
  )
}
