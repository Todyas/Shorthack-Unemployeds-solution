export default function MessageBubble({ author, text }) {
  const isUser = author === 'user'
  return (
    <div className={`msg-in flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed ${
          isUser ? 'bg-sber-500 text-white rounded-br-sm' : 'bg-ink-100 text-ink-900 rounded-bl-sm'
        }`}
      >
        {text}
      </div>
    </div>
  )
}
