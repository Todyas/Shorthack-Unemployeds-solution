export default function DemoSwitcher({ mode, setMode }) {
  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1 bg-white/90 backdrop-blur border border-ink-200/70 rounded-full p-1 shadow-soft text-sm">
      <span className="px-2.5 text-[11px] font-medium text-ink-400 hidden sm:inline">Демо</span>
      <button
        onClick={() => setMode('operator')}
        className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
          mode === 'operator' ? 'bg-sber-500 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50'
        }`}
      >
        Оператор
      </button>
      <button
        onClick={() => setMode('user')}
        className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
          mode === 'user' ? 'bg-sber-500 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50'
        }`}
      >
        Пользователь
      </button>
    </div>
  )
}
