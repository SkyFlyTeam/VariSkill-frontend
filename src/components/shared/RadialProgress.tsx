type RadialProgressProps = {
    value: number
}

export function RadialProgress({ value }: RadialProgressProps) {
    const percentage = Number.isFinite(value)
        ? Math.round(Math.min(100, Math.max(0, value)))
        : 0

    return (
        <div
            role="progressbar"
            aria-label="Conclusão da trilha"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={`${percentage}% concluído`}
            className="relative size-9 shrink-0 rounded-full"
            style={{
                background: `conic-gradient(#38b5e5 ${percentage}%, #dbe5eb ${percentage}% 100%)`,
            }}
        >
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white text-[9px] font-medium text-slate-700">
                {percentage}%
            </div>
        </div>
    )
}
