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
        <article className="flex min-h-24 flex-col items-center justify-start gap-1 rounded-2xl bg-white px-2 py-3 text-center shadow-[0_3px_8px_rgba(15,23,42,0.08)] sm:min-h-21 sm:flex-row sm:gap-5 sm:px-4 sm:py-3 sm:text-left">
            <div className={`shrink-0 ${color}`}>
                <Icon
                    aria-hidden="true"
                    className="size-7 stroke-[1.9] sm:size-9"
                />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-medium leading-tight text-slate-500 sm:text-[10px]">
                    {label}
                </p>
                <p className="mt-1 text-base font-bold leading-none text-slate-900 sm:text-lg">
                    {value}
                </p>
                <p className="mt-1 text-[9px] leading-none text-slate-500 sm:mt-2 sm:text-[10px]">
                    {description}
                </p>
            </div>
        </article>
    )
}
