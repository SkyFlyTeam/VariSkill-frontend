import { Sparkles, ArrowRight, BookOpen } from "lucide-react"

export type TrackRecommendationCardProps = {
    id: string
    title: string
    skill: string
    reason?: string
    onStartTrack?: (id: string) => void | Promise<void>
    loading?: boolean
    compact?: boolean
}

export function TrackRecommendationCard({
    id,
    title,
    skill,
    reason,
    onStartTrack,
    loading = false,
    compact = false,
}: TrackRecommendationCardProps) {
    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/40 p-4 shadow-sm transition-all duration-200 hover:border-sky-200 hover:shadow-md ${
                compact ? "max-w-md w-full" : "w-full"
            }`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                        <Sparkles className="size-3 text-sky-600" />
                        {skill}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <BookOpen className="size-3" />
                        Trilha recomendada
                    </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                    {title}
                </h4>

                {reason && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80">
                        {reason}
                    </p>
                )}
            </div>

            <div className="mt-3.5 pt-2 flex items-center justify-end">
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => onStartTrack?.(id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span>Iniciando...</span>
                    ) : (
                        <>
                            <span>Iniciar Trilha</span>
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

