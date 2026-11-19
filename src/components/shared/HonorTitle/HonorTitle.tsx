import { LockOverlay } from "@/components/shared/LockOverlay/LockOverlay"
import { cn } from "@/lib/utils"

export type HonorTitleProps = {
    title: string
    locked?: boolean
    className?: string
}

/** Pílula vermelha com o título de honra do estudante. */
export function HonorTitle({
    title,
    locked = false,
    className,
}: HonorTitleProps) {
    return (
        <span
            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-red px-4 py-1 text-xs font-semibold whitespace-nowrap text-white",
                locked && "bg-[#8f1c26] text-white/60",
                className,
            )}
        >
            {title}
            {locked && (
                <LockOverlay
                    label={`${title} bloqueado`}
                    className="bg-transparent"
                    iconClassName="size-4"
                />
            )}
        </span>
    )
}
