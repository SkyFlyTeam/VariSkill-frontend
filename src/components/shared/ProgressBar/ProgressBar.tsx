import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type ProgressBarProps = Omit<ComponentProps<"div">, "children"> & {
    value: number
}

export function ProgressBar({ value, className, ...props }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, value))

    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            className={cn(
                "h-1.5 w-full overflow-hidden rounded-full bg-slate-200 sm:h-2",
                className,
            )}
            {...props}
        >
            <div
                data-slot="progress-fill"
                className="h-full rounded-full bg-sky-500 transition-[width] duration-500 ease-out"
                style={{ width: `${clamped}%` }}
            />
        </div>
    )
}
