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

const purposeIcons: Record<ActivityPurpose, { icon: LucideIcon; color: string }> = {
    theoretical: { icon: BookOpen, color: "text-sky-600" },
    practical: { icon: FileCode, color: "text-violet-600" },
    exam: { icon: Trophy, color: "text-amber-400" },
}

export function ActivityNode({
    title,
    purpose,
    status,
    onClick,
    className,
}: ActivityNodeProps) {
    const { icon: PurposeIcon, color } = purposeIcons[purpose]
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
                "flex w-full items-center gap-3 rounded-xl border-2 border-transparent bg-slate-100 px-4 py-3 text-left transition-colors",
                isLocked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-slate-200 focus-visible:border-sky-500 focus-visible:outline-none",
                isInProgress && "border-sky-500",
                className,
            )}
        >
            <span className={cn("shrink-0", color)}>
                <PurposeIcon className="size-6" aria-hidden="true" />
            </span>

            <span className="flex-1 text-sm font-medium text-slate-800">
                {title}
            </span>

            {isLocked && (
                <Lock
                    className="size-5 shrink-0 text-slate-400"
                    aria-hidden="true"
                />
            )}

            {isCompleted && (
                <Check
                    className="size-5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                />
            )}
        </button>
    )
}
