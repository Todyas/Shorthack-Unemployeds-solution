export default function RawTextTab({ ticket }) {
  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-6">
      <p className="text-sm leading-relaxed whitespace-pre-line max-w-2xl">{ticket.original}</p>
    </div>
  )
}
