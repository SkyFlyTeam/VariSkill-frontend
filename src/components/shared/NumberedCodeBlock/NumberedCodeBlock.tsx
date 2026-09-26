import { cn } from "@/lib/utils"

type NumberedCodeBlockProps = {
    lines: string[]
    className?: string
}

/**
 * Bloco de código com linhas numeradas (1..N) na lateral esquerda,
 * em caixa cinza — conforme o frame "Lição".
 */
export function NumberedCodeBlock({
    lines,
    className,
}: NumberedCodeBlockProps) {
    return (
        <div
            className={cn("overflow-hidden rounded-lg bg-[#f1f3f5]", className)}
        >
            <div className="flex">
                <div
                    aria-hidden="true"
                    className="flex select-none flex-col py-3 pr-2 pl-3 text-right font-mono text-[11px] leading-6 text-slate-400"
                >
                    {lines.map((_, index) => (
                        <span key={index}>{index + 1}</span>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto py-3 pr-4 font-mono text-[12px] leading-6 text-slate-700">
                    {lines.map((line, index) => (
                        <div key={index} className="whitespace-pre">
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
