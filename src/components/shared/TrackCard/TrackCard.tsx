import { type ReactNode, useId } from "react"

import { Link } from "react-router-dom"

import { RadialProgress } from "@/components/shared/RadialProgress"

type TrackCardBaseProps = {
    id: string
    title: string
    category?: string
    image: ReactNode
    totalModules: number
}

export type TrackCardProps = TrackCardBaseProps &
    (
        | { variant: "in-progress"; completedModules: number }
        | { variant: "available"; completedModules?: never }
    )

function normalizeCount(value: number) {
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

export function TrackCard(props: TrackCardProps) {
    const { id, title, category = "Tecnologia", image } = props
    const descriptionId = useId()
    const total = normalizeCount(props.totalModules)
    const completed =
        props.variant === "in-progress"
            ? Math.min(total, normalizeCount(props.completedModules))
            : 0
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    const moduleLabel = total === 1 ? "módulo" : "módulos"
    const inProgress = props.variant === "in-progress"

    return (
        <Link
            to={`/trilhas/${encodeURIComponent(id)}`}
            aria-label={`${inProgress ? "Continuar" : "Começar"} trilha ${title}`}
            aria-describedby={descriptionId}
            className="group flex min-h-20 min-w-0 items-center gap-3 rounded-xl bg-white px-3.5 py-3 shadow-[0_3px_8px_rgba(15,23,42,0.08)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 motion-reduce:transform-none motion-reduce:transition-none"
        >
            <div
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-slate-100"
            >
                {image}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium text-sky-700">
                    {category}
                </p>
                <h3
                    className="truncate text-xs font-bold text-slate-900"
                    title={title}
                >
                    {title}
                </h3>
                <p
                    id={descriptionId}
                    className="mt-2 text-[9px] text-slate-600"
                >
                    {inProgress ? `${completed}/${total}` : total} {moduleLabel}
                </p>
            </div>
            {inProgress ? (
                <RadialProgress value={progress} />
            ) : (
                <span className="shrink-0 rounded-lg bg-main-blue-dark px-3 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-sky-800 group-focus-visible:bg-sky-800 motion-reduce:transition-none">
                    Começar
                </span>
            )}
        </Link>
    )
}
