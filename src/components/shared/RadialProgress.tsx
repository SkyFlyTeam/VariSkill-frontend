type RadialProgressProps = {
    value: number
}

export function RadialProgress({ value }: RadialProgressProps) {
    return (
        <div
            aria-label={`${value}% concluído`}
            className="relative size-9 shrink-0 rounded-full"
            style={{
                background: `conic-gradient(#38b5e5 ${value}%, #dbe5eb ${value}% 100%)`,
            }}
        >
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white text-[9px] font-medium text-slate-700">
                {value}%
            </div>
        </div>
    )
}
