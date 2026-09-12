export default function OptionButtons({ options, onSelect }) {
  return (
    <div className="msg-in flex flex-wrap gap-2 justify-start pl-1">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          className="chip text-sm px-3 py-1.5 rounded-full border border-sber-200 text-sber-700 bg-sber-50 hover:bg-sber-100"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
