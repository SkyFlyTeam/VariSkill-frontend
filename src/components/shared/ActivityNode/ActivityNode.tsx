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
                "relative flex h-[73px] w-[134px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-neutral-200 px-3 py-2 text-center transition-colors",
                isLocked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-neutral-300 focus-visible:border-sky-500 focus-visible:outline-none",
                isInProgress && "border-sky-500",
                className,
            )}
        >
            <PurposeIcon
                className="size-6 shrink-0 text-black"
                aria-hidden="true"
            />

            <span className="text-xs font-medium text-neutral-800">
                {title}
            </span>

            {isLocked && (
                <Lock
                    className="absolute top-2 right-2 size-4 text-slate-400"
                    aria-hidden="true"
                />
            )}

            {isCompleted && (
                <Check
                    className="absolute top-2 right-2 size-4 text-emerald-500"
                    aria-hidden="true"
                />
            )}
        </button>
    )
}
