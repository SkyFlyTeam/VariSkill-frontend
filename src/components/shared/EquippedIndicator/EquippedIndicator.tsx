import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type EquippedIndicatorProps = {
    size?: "sm" | "md"
    className?: string
}

/** Selo verde exibido no canto do item equipado. */
export function EquippedIndicator({
    size = "md",
    className,
}: EquippedIndicatorProps) {
    return (
        <span
            role="img"
            aria-label="Equipado"
            className={cn(
                "z-20 grid place-items-center rounded-full bg-[#2fcc2f] text-[#0f5c0f] shadow-sm",
                size === "md" ? "size-9" : "size-5",
                className,
            )}
        >
            <Check
                aria-hidden="true"
                className={cn(
                    "stroke-[2.5]",
                    size === "md" ? "size-5" : "size-3",
                )}
            />
        </span>
    )
}
