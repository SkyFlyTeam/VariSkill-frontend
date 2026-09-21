import type { LucideIcon } from "lucide-react"

type InfoCardProps = {
    label: string
    value: string
    description: string
    icon: LucideIcon
    color: string
}

export function InfoCard({
    label,
    value,
    description,
    icon: Icon,
    color,
}: InfoCardProps) {
    return (
        <article className="flex min-h-20 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_3px_8px_rgba(15,23,42,0.08)] sm:min-h-21">
            <div className={`shrink-0 ${color}`}>
                <Icon aria-hidden="true" className="size-9 stroke-[1.9]" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-medium leading-tight text-slate-500">
                    {label}
                </p>
                <p className="mt-1 text-lg font-bold leading-none text-slate-900">
                    {value}
                </p>
                <p className="mt-2 text-[10px] leading-none text-slate-500">
                    {description}
                </p>
            </div>
        </article>
    )
}