type QuickChipsProps = {
    chips: string[]
    onSelect: (chip: string) => void
    disabled?: boolean
}

export function QuickChips({
    chips,
    onSelect,
    disabled = false,
}: QuickChipsProps) {
    if (chips.length === 0) return null

    return (
        <div
            role="group"
            aria-label="Sugestões rápidas"
            className="flex gap-2 overflow-x-auto pb-1"
        >
            {chips.map((chip) => (
                <button
                    key={chip}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(chip)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#e91a36] shadow-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {chip}
                </button>
            ))}
        </div>
    )
}
