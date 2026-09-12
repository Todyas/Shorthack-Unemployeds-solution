import { useState } from 'react'

export default function ReplyComposer({ ticket }) {
  const [reply, setReply] = useState('')

  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-sm">Ответ пользователю</h3>
        <button onClick={() => setReply(ticket.aiDraft)} className="text-xs text-ai-600 font-medium hover:text-ai-700">
          Вставить черновик от ИИ
        </button>
      </div>
      <textarea
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Напишите ответ пользователю..."
        className="w-full text-sm border border-ink-200 rounded-xl p-3 bg-ink-50 resize-none"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        <button className="text-sm font-medium px-4 py-2 rounded-lg bg-sber-500 text-white hover:bg-sber-600">
          Отправить и принять заявку
        </button>
        <button className="text-sm font-medium px-4 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
          Запросить уточнение
        </button>
        <button className="text-sm font-medium px-4 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
          Передать команде
        </button>
      </div>
    </div>
  )
}
