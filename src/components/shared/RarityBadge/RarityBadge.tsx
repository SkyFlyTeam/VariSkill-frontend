import { cn } from "@/lib/utils"
import type { ItemRaridade } from "@/services/inventoryService"

type RarityStyle = { label: string; className: string }

const RARITY_STYLES: Record<ItemRaridade, RarityStyle> = {
    COMUM: { label: "Comum", className: "bg-[#49b8df] text-[#06244b]" },
    RARO: { label: "Raro", className: "bg-[#2f6fdf] text-white" },
    EPICO: { label: "Épico", className: "bg-[#b84dff] text-[#2a0646]" },
    LENDARIO: { label: "Lendário", className: "bg-[#ffb800] text-[#a33a00]" },
}

export type RarityBadgeProps = {
    rarity: ItemRaridade
    className?: string
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
    const style = RARITY_STYLES[rarity] ?? RARITY_STYLES.COMUM

    return (
        <span
            data-rarity={rarity}
            className={cn(
                "inline-flex min-w-16 items-center justify-center rounded-full px-4 py-0.5 text-[11px] font-medium",
                style.className,
                className,
            )}
        >
            {style.label}
        </span>
    )
}
