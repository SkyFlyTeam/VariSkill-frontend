import { type ReactNode, useId } from "react"

import { cn } from "@/lib/utils"

export type InventorySectionProps = {
    title: string
    children: ReactNode
    loading?: boolean
    error?: string | null
    isEmpty?: boolean
    emptyMessage?: string
    className?: string
}

/** Título da categoria + painel cinza com a grade de itens. */
export function InventorySection({
    title,
    children,
    loading = false,
    error = null,
    isEmpty = false,
    emptyMessage = "Nenhum item disponível.",
    className,
}: InventorySectionProps) {
    const headingId = useId()

    let content: ReactNode = (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {children}
        </div>
    )
    if (loading) {
        content = <p className="text-sm text-slate-600">Carregando...</p>
    } else if (error) {
        content = (
            <p role="alert" className="text-sm text-brand-red">
                {error}
            </p>
        )
    } else if (isEmpty) {
        content = <p className="text-sm text-slate-600">{emptyMessage}</p>
    }

    return (
        <section
            aria-labelledby={headingId}
            className={cn("flex flex-col gap-4", className)}
        >
            <h2
                id={headingId}
                className="text-2xl font-bold tracking-tight text-[#0b2550]"
            >
                {title}
            </h2>
            <div className="rounded-xl bg-[#d1d5dc] p-5 sm:p-6">{content}</div>
        </section>
    )
}
