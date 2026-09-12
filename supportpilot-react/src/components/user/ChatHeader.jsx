export default function ChatHeader() {
  return (
    <div className="h-16 shrink-0 flex items-center gap-3 px-4 border-b border-ink-200">
      <div className="w-9 h-9 rounded-full bg-sber-500 flex items-center justify-center text-white font-display font-bold">S</div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold leading-none">Техподдержка</p>
        <p className="text-xs text-sber-600 flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sber-500" />ИИ-помощник онлайн
        </p>
      </div>
    </div>
  )
}
