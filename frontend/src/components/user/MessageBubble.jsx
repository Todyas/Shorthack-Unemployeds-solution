export default function MessageBubble({ author, text }) {
  const isUser = author === 'user'
  return (
    <div className={`msg-in flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
          isUser ? 'bg-sber-500 text-white rounded-br-md' : 'bg-ai-50 text-ink-800 rounded-bl-md'
        }`}
      >
        {text}
      </div>
    </div>
  )
}
