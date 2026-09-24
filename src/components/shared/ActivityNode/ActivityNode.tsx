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

export function ActivityNode({
    title,
    purpose,
    status,
    onClick,
    className,
}: ActivityNodeProps) {
    const PurposeIcon = purposeIcons[purpose]
    const isLocked = status === "locked"
    const isInProgress = status === "in_progress"
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
                "relative flex aspect-[134/73] w-full max-w-[134px] min-w-[104px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-neutral-200 px-2 py-2 text-center transition-colors sm:gap-3",
                isLocked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-neutral-300 focus-visible:border-sky-500 focus-visible:outline-none",
                isInProgress && "border-sky-500",
                className,
            )}
        >
            <PurposeIcon
                className="size-4 shrink-0 text-black sm:size-[17px]"
                aria-hidden="true"
            />

            <span className="text-[10px] font-medium text-neutral-800 sm:text-xs">
                {title}
            </span>

            {isLocked && (
                <Lock
                    className="absolute top-1.5 right-1.5 size-3 text-slate-400 sm:top-2 sm:right-2 sm:size-4"
                    aria-hidden="true"
                />
            )}

            {isCompleted && (
                <Check
                    className="absolute top-1.5 right-1.5 size-3 text-emerald-500 sm:top-2 sm:right-2 sm:size-4"
                    aria-hidden="true"
                />
            )}
        </button>
    )
}
