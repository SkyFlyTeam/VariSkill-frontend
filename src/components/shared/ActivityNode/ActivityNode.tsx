import type { LucideIcon } from "lucide-react"
import { BookOpen, Check, FileCode, Lock, Trophy } from "lucide-react"

import { cn } from "@/lib/utils"

export type ActivityPurpose = "theoretical" | "practical" | "exam"

export type ActivityStatus = "locked" | "in_progress" | "completed"

type ActivityNodeProps = {
    title: string
    purpose: ActivityPurpose
    status: ActivityStatus
    onClick?: () => void
    className?: string
}

const purposeIcons: Record<ActivityPurpose, LucideIcon> = {
    theoretical: BookOpen,
    practical: FileCode,
    exam: Trophy,
}

const purposeStyles: Record<ActivityPurpose, string> = {
    theoretical: "bg-[#155dfc] shadow-[0_5px_0_0_#193cb8]",
    practical: "bg-[#9810fa] shadow-[0_5px_0_0_#6e11b0]",
    exam: "bg-[#ffb900] shadow-[0_5px_0_0_#fe9a00]",
}

export function ActivityNode({
    title,
    purpose,
    status,
    onClick,
    className,
}: ActivityNodeProps) {
    const PurposeIcon = purposeIcons[purpose]
    const isLocked = status === "locked"
    const isCompleted = status === "completed"

    function handleClick() {
        if (isLocked) {
            return
        }

        onClick?.()
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLocked}
            data-status={status}
            data-purpose={purpose}
            className={cn(
                "relative flex aspect-[134/73] w-full max-w-[134px] min-w-[104px] flex-col items-center justify-center gap-2 rounded-lg px-2 py-2 text-center text-white transition-all sm:gap-3",
                purposeStyles[purpose],
                isLocked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none active:translate-y-[3px] active:shadow-none",
                className,
            )}
        >
            <PurposeIcon
                className="size-4 shrink-0 sm:size-[17px]"
                aria-hidden="true"
            />

            <span className="text-[10px] font-medium sm:text-xs">{title}</span>

            {isLocked && (
                <Lock
                    className="absolute top-1.5 right-1.5 size-3 sm:top-2 sm:right-2 sm:size-4"
                    aria-hidden="true"
                />
            )}

            {isCompleted && (
                <Check
                    className="absolute top-1.5 right-1.5 size-3 sm:top-2 sm:right-2 sm:size-4"
                    aria-hidden="true"
                />
            )}
        </button>
    )
}
