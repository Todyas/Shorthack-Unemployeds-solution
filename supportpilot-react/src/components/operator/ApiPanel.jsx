import { useEffect, useState } from 'react'
import { API_BASE_URL, checkLlmStatus } from '../../api/client.js'

const PROVIDER_LABELS = {
  yandex: 'Yandex Cloud',
  anthropic: 'Anthropic Claude',
  fallback: 'Эвристика (ключ не задан)',
}

const ENDPOINTS = [
  { method: 'GET', path: '/health', description: 'Проверка живости бэкенда' },
  { method: 'GET', path: '/api/llm/status', description: 'Реальная проверка ключа ИИ-провайдера' },
  { method: 'POST', path: '/api/tickets/ingest', description: 'Декомпозиция обращения на заявки (вызывает ИИ)' },
  { method: 'GET', path: '/api/tickets', description: 'Список заявок (фильтры: status, priority, category)' },
  { method: 'GET', path: '/api/tickets/{id}', description: 'Одна заявка по id' },
  { method: 'PATCH', path: '/api/tickets/{id}', description: 'Изменение статуса / текста ответа оператором' },
  { method: 'POST', path: '/api/tickets/{id}/reanalyze', description: 'Повторный анализ ИИ без изменения статуса' },
  { method: 'POST', path: '/api/tickets/{id}/send', description: 'Отметить заявку отправленной/решённой' },
]

const METHOD_STYLE = {
  GET: 'bg-sber-100 text-sber-700',
  POST: 'bg-ai-100 text-ai-700',
  PATCH: 'bg-amber-100 text-amber-700',
}

function absoluteUrl(path) {
  // При относительном API_BASE_URL (прод-сборка за nginx) собираем полный
  // адрес из текущего origin, чтобы ссылки на /docs и т.п. были кликабельны.
  const base = API_BASE_URL || window.location.origin
  return `${base}${path}`
}

export default function ApiPanel() {
  const [status, setStatus] = useState('checking') // 'checking' | 'ok' | 'down'
  const [checkedAt, setCheckedAt] = useState(null)
  const [llmStatus, setLlmStatus] = useState(null)
  const [llmChecking, setLlmChecking] = useState(false)
  const [llmError, setLlmError] = useState(null)

  async function checkHealth() {
    setStatus('checking')
    try {
      const response = await fetch(absoluteUrl('/health'))
      setStatus(response.ok ? 'ok' : 'down')
    } catch {
      setStatus('down')
    } finally {
      setCheckedAt(new Date().toLocaleTimeString('ru-RU'))
    }
  }

  async function checkLlmKey() {
    setLlmChecking(true)
    setLlmError(null)
    try {
      const result = await checkLlmStatus()
      setLlmStatus(result)
    } catch (e) {
      setLlmError(e.message)
    } finally {
      setLlmChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <section>
      <header className="h-16 border-b border-ink-200 bg-white flex items-center justify-between px-6">
        <h1 className="font-display font-bold text-xl">API / Бэкенд</h1>
        <button
          onClick={checkHealth}
          className="text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50"
        >
          Проверить снова
        </button>
      </header>

      <div className="p-6 space-y-5 max-w-3xl">
        <div className="bg-white border border-ink-200 rounded-2xl p-5 flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              status === 'ok' ? 'bg-sber-500' : status === 'down' ? 'bg-rose-500' : 'bg-amber-400'
            }`}
          />
          <div className="text-sm">
            <p className="font-medium">
              {status === 'ok' && 'Бэкенд доступен'}
              {status === 'down' && 'Бэкенд недоступен'}
              {status === 'checking' && 'Проверяем соединение...'}
            </p>
            <p className="text-xs text-ink-500">
              {absoluteUrl('')} {checkedAt && `· проверено в ${checkedAt}`}
            </p>
          </div>
        </div>

        <div className="bg-white border border-ink-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm">Ключ ИИ-провайдера</h3>
            <button
              onClick={checkLlmKey}
              disabled={llmChecking}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-60"
            >
              {llmChecking ? 'Проверяем...' : 'Проверить ключ'}
            </button>
          </div>
          <p className="text-xs text-ink-500 mb-3">
            Настоящий тестовый запрос к провайдеру (не просто "переменная задана") — покажет реальную причину, если ключ не работает.
          </p>

          {llmError && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              Не удалось выполнить проверку: {llmError}
            </p>
          )}

          {llmStatus && (
            <div className="flex items-start gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                  !llmStatus.configured ? 'bg-amber-400' : llmStatus.reachable ? 'bg-sber-500' : 'bg-rose-500'
                }`}
              />
              <div className="text-sm">
                <p className="font-medium">
                  Провайдер: {PROVIDER_LABELS[llmStatus.provider] || llmStatus.provider}
                  {llmStatus.configured && (llmStatus.reachable ? ' — ключ работает' : ' — ключ не работает')}
                </p>
                {!llmStatus.configured && (
                  <p className="text-xs text-ink-500 mt-0.5">
                    YANDEX_API_KEY / ANTHROPIC_API_KEY не заданы — используется эвристика по ключевым словам.
                  </p>
                )}
                {llmStatus.configured && !llmStatus.reachable && (
                  <p className="text-xs text-rose-600 mt-0.5 break-all">{llmStatus.error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-ink-200 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-sm mb-3">Документация</h3>
          <div className="flex flex-wrap gap-2">
            <a
              href={absoluteUrl('/docs')}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-sber-500 text-white hover:bg-sber-600"
            >
              Swagger UI
            </a>
            <a
              href={absoluteUrl('/redoc')}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50"
            >
              ReDoc
            </a>
            <a
              href={absoluteUrl('/openapi.json')}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50"
            >
              openapi.json
            </a>
          </div>
        </div>

        <div className="bg-white border border-ink-200 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-sm mb-3">Ручки REST API</h3>
          <ul className="space-y-2">
            {ENDPOINTS.map((ep) => (
              <li key={ep.method + ep.path} className="flex items-start gap-3 text-sm">
                <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${METHOD_STYLE[ep.method]}`}>
                  {ep.method}
                </span>
                <div>
                  <code className="text-ink-900">{ep.path}</code>
                  <p className="text-xs text-ink-500">{ep.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
