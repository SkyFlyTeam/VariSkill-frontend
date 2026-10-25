import { Search, X } from "lucide-react"

type TrackSearchProps = {
    value: string
    onChange: (value: string) => void
}

export function TrackSearch({ value, onChange }: TrackSearchProps) {
    return (
        <div className="relative">
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") onChange("")
                }}
                placeholder="Buscar trilhas por nome, tema ou habilidade"
                aria-label="Buscar trilhas"
                className="h-11 w-full rounded-xl border border-transparent bg-white pr-10 pl-10 text-sm shadow-[0_3px_8px_rgba(15,23,42,0.08)] outline-none placeholder:text-slate-400 focus-visible:border-sky-700 [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    aria-label="Limpar busca"
                    className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <X aria-hidden="true" className="size-4" />
                </button>
            )}
        </div>
    )
}
