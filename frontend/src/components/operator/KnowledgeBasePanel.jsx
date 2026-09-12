import { useEffect, useState } from 'react'
import { fetchKb } from '../../api/client.js'

const CATEGORY_LABELS = {
  wifi: 'Wi-Fi',
  vpn: 'VPN',
  access_control: 'СКУД',
  personal_cabinet: 'Личный кабинет',
  password_reset: 'Сброс пароля',
  hr: 'HR',
  other: 'Другое',
}

export default function KnowledgeBasePanel() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    fetchKb()
      .then((data) => setArticles(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <header className="h-16 border-b border-ink-200/70 bg-white flex items-center justify-between px-6">
        <h1 className="font-display font-bold text-xl tracking-tight">База знаний</h1>
        <p className="text-xs text-ink-400 hidden sm:block">Эти статьи ИИ использует, чтобы предложить рекомендованный ответ</p>
      </header>

      <div className="p-6 max-w-3xl space-y-3">
        {loading && <p className="text-sm text-ink-500">Загрузка статей...</p>}
        {error && (
          <div className="text-sm bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3">
            Не удалось загрузить базу знаний: {error}
          </div>
        )}
        {!loading && !error && articles.length === 0 && (
          <p className="text-sm text-ink-400">Пока пусто — статьи задаются в kb.json на бэкенде.</p>
        )}

        {articles.map((a) => {
          const isOpen = openId === a.id
          return (
            <div key={a.id} className="surface overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : a.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">{a.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-ai-50 text-ai-700">
                      {CATEGORY_LABELS[a.category] || a.category}
                    </span>
                    <code className="text-[11px] text-ink-400">{a.id}</code>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-ink-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-0 border-t border-ink-100">
                  <p className="eyebrow mt-3 mb-1.5">Ключевые слова</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(a.keywords || []).map((k) => (
                      <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-600 border border-ink-100">{k}</span>
                    ))}
                  </div>
                  <p className="eyebrow mb-1.5">Текст шаблона</p>
                  <p className="text-sm text-ink-700 leading-relaxed bg-sber-50/60 rounded-xl px-3.5 py-3">{a.template_body}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
