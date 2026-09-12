export default function DemoSwitcher({ mode, setMode }) {
  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1 bg-white border border-ink-200 rounded-full p-1 shadow-card text-sm">
      <span className="px-2 text-xs text-ink-500 hidden sm:inline">Демо-режим</span>
      <button
        onClick={() => setMode('operator')}
        className={`px-3 py-1.5 rounded-full font-medium ${mode === 'operator' ? 'bg-sber-500 text-white' : 'text-ink-700'}`}
      >
        Оператор
      </button>
      <button
        onClick={() => setMode('user')}
        className={`px-3 py-1.5 rounded-full font-medium ${mode === 'user' ? 'bg-sber-500 text-white' : 'text-ink-700'}`}
      >
        Пользователь
      </button>
    </div>
  )
}
