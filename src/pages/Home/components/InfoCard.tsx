import type { ReactNode } from "react"

import type { LucideIcon } from "lucide-react"

type InfoCardProps = {
    label: string
    value: string
    description: string
    /** Ícone do lucide ou um nó customizado (ex.: <FireStreak />). */
    icon: LucideIcon | ReactNode
    color?: string
}

function isLucideIcon(icon: InfoCardProps["icon"]): icon is LucideIcon {
    // Ícones do lucide são componentes forwardRef (objetos com `render`) ou funções.
    return (
        typeof icon === "function" ||
        (typeof icon === "object" && icon !== null && "render" in icon)
    )
}

export function InfoCard({
    label,
    value,
    description,
    icon,
    color = "",
}: InfoCardProps) {
    const Icon = isLucideIcon(icon) ? icon : null

    return (
        <article className="flex min-h-24 flex-col items-center justify-start gap-1 rounded-2xl bg-white px-2 py-3 text-center shadow-[0_3px_8px_rgba(15,23,42,0.08)] sm:min-h-21 sm:flex-row sm:gap-5 sm:px-4 sm:py-3 sm:text-left">
            <div className={`shrink-0 ${color}`}>
                {Icon ? (
                    <Icon
                        aria-hidden="true"
                        className="size-7 stroke-[1.9] sm:size-9"
                    />
                ) : (
                    (icon as ReactNode)
                )}
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
