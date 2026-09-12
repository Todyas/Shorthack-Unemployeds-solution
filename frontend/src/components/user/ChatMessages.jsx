import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import OptionButtons from './OptionButtons.jsx'
import TicketCreatedCard from './TicketCreatedCard.jsx'

export default function ChatMessages({ messages, onSelectOption }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((m) => {
        if (m.kind === 'bubble') return <MessageBubble key={m.id} author={m.author} text={m.text} />
        if (m.kind === 'options') return <OptionButtons key={m.id} options={m.options} onSelect={(opt) => onSelectOption(m.id, opt)} />
        if (m.kind === 'ticket') return <TicketCreatedCard key={m.id} ticket={m.ticket} />
        return null
      })}
      <div ref={endRef} />
    </div>
  )
}
