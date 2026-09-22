import type { ReactNode } from "react"

import { RadialProgress } from "../../../components/shared/RadialProgress"

type TrialCardProps = {
    category: string
    title: string
    modules: string
    image: ReactNode
    progress?: number
}

export function TrialCard({
    category,
    title,
    modules,
    image,
    progress,
}: TrialCardProps) {
    const hasProgress = progress !== undefined

    return (
        <article className="flex min-h-20 items-center gap-3 rounded-xl bg-white px-3.5 py-3 shadow-[0_3px_8px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-0.5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                {image}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium text-sky-500">
                    {category}
                </p>
                <h3 className="truncate text-xs font-bold text-slate-900">
                    {title}
                </h3>
                <p className="mt-2 text-[9px] text-slate-600">{modules}</p>
            </div>
            {hasProgress && <RadialProgress value={progress} />}
        </article>
    )
}
