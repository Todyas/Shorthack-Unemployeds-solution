export default function OptionButtons({ options, onSelect }) {
  return (
    <div className="msg-in flex flex-wrap gap-2 justify-start pl-1">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          className="chip text-sm px-3.5 py-1.5 rounded-full border border-sber-200 text-sber-700 bg-white hover:bg-sber-50"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
