import type { ReactNode } from "react"

import { EquippedIndicator } from "@/components/shared/EquippedIndicator/EquippedIndicator"
import { RarityBadge } from "@/components/shared/RarityBadge/RarityBadge"
import { cn } from "@/lib/utils"
import type { ItemRaridade } from "@/services/inventoryService"

export type CosmeticItemCardProps = {
    name: string
    description: string
    rarity: ItemRaridade
    /** Pré-visualização do item (avatar, borda, título...). */
    preview: ReactNode
    /** Oculta o nome acima da pré-visualização (ex.: títulos já exibem o nome). */
    showName?: boolean
    equipped?: boolean
    locked?: boolean
    pending?: boolean
    indicatorSize?: "sm" | "md"
    onSelect?: () => void
    className?: string
}

/** Cartão selecionável de item cosmético do inventário. */
export function CosmeticItemCard({
    name,
    description,
    rarity,
    preview,
    showName = true,
    equipped = false,
    locked = false,
    pending = false,
    indicatorSize = "md",
    onSelect,
    className,
}: CosmeticItemCardProps) {
    const actionLabel = locked
        ? `${name} (bloqueado)`
        : equipped
          ? `${name} (equipado)`
          : `Equipar ${name}`

    return (
        <button
            type="button"
            onClick={onSelect}
            // Bloqueados continuam clicáveis para o usuário receber o aviso.
            disabled={pending}
            aria-disabled={locked || undefined}
            aria-pressed={equipped}
            aria-busy={pending}
            aria-label={actionLabel}
            className={cn(
                "group flex flex-col items-center gap-3 rounded-xl p-1 text-left transition outline-none",
                "focus-visible:ring-3 focus-visible:ring-[#2599c8]/60",
                !locked && !equipped && "cursor-pointer hover:-translate-y-0.5",
                locked && "cursor-not-allowed",
                pending && "opacity-70",
                className,
            )}
        >
            {showName && (
                <span className="text-center text-xs font-semibold text-[#0b2550]">
                    {name}
                </span>
            )}

            <span className="relative">
                {preview}
                {equipped && (
                    <EquippedIndicator
                        size={indicatorSize}
                        className={cn(
                            "absolute",
                            indicatorSize === "md"
                                ? "top-2 -right-1"
                                : "-top-2 -right-2",
                        )}
                    />
                )}
            </span>

            <RarityBadge rarity={rarity} />

            <span className="w-full text-[11px] leading-snug font-medium text-slate-700">
                {description}
            </span>
        </button>
    )
}
