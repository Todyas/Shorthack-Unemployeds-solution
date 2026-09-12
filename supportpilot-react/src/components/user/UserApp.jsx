import { useEffect, useRef, useState } from 'react'
import { useTickets } from '../../context/TicketsContext.jsx'
import { chatTree, ticketCreationNodes } from '../../data/chatTree.js'
import ChatHeader from './ChatHeader.jsx'
import ChatMessages from './ChatMessages.jsx'
import ChatComposer from './ChatComposer.jsx'

export default function UserApp() {
  const { addTicket } = useTickets()
  const [messages, setMessages] = useState([])
  const [currentNode, setCurrentNode] = useState('root')
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

  function goToNode(key) {
    // Узел создания заявки
    if (ticketCreationNodes[key]) {
      const data = ticketCreationNodes[key]
      const ticket = addTicket({
        category: data.category,
        priority: data.priority,
        title: data.title,
        summary: data.summary,
      })
      setTimeout(() => {
        pushBubble('bot', data.botReply)
        pushTicket(ticket)
        finishFlow()
      }, 400)
      return
    }

    const node = chatTree[key]
    if (!node) return
    setCurrentNode(key)
    setTimeout(() => {
      pushBubble('bot', node.text)
      if (node.options && node.options.length) pushOptions(node.options)
    }, 350)
  }

  function finishFlow() {
    setTimeout(() => {
      pushBubble('bot', 'Могу ещё чем-то помочь? Можете написать новый вопрос в любой момент.')
      setCurrentNode('root_free')
    }, 900)
  }

  function handleSelectOption(optionsMessageId, opt) {
    removeMessage(optionsMessageId)
    pushBubble('user', opt.label)
    goToNode(opt.next)
  }

  function handleSend(text) {
    pushBubble('user', text)
    const isFreeMode = currentNode === 'free' || currentNode === 'root_free'
    if (isFreeMode) {
      setTimeout(() => {
        const ticket = addTicket({
          category: 'Другое',
          priority: 'low',
          title: 'Обращение из чата',
          summary: text,
        })
        pushBubble('bot', 'Спасибо, я оформил заявку по вашему описанию и передал оператору.')
        pushTicket(ticket)
        finishFlow()
      }, 400)
    } else {
      setTimeout(() => {
        pushBubble('bot', 'Записал это в заявку. Пожалуйста, выберите вариант выше или уточните детали.')
      }, 400)
    }
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
