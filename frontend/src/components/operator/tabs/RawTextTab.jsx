export default function RawTextTab({ ticket }) {
  return (
    <div className="surface p-6">
      <p className="text-sm leading-relaxed whitespace-pre-line max-w-2xl border-l-2 border-ink-200 pl-4 text-ink-800">
        {ticket.original}
      </p>
    </div>
  )
}
