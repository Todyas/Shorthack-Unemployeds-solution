import { useState } from 'react'

export default function ChatComposer({ onSend }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="border-t border-ink-200/70 p-3 shrink-0 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder="Напишите сообщение..."
          className="flex-1 text-sm border border-ink-200 rounded-full px-4 py-2.5 bg-ink-50 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          className="w-10 h-10 shrink-0 rounded-full bg-sber-500 text-white flex items-center justify-center hover:bg-sber-600 shadow-soft disabled:opacity-50"
          disabled={!value.trim()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
