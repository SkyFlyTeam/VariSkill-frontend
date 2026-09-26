import React from "react"

import { cn } from "cn"

export interface CodeFrameProps {
    lines: string[]
    renderLine: (line: string, lineIndex: number) => React.ReactNode
    fileName?: string
    language?: string
    className?: string
}

export const CodeFrame: React.FC<CodeFrameProps> = ({
    lines,
    renderLine,
    fileName = "exercise.js",
    language = "JavaScript",
    className,
}) => {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-[15px] border border-white/10 bg-[#6B6B6B] shadow-md",
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold text-white/80">
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-red-500/80" />
                    <span className="size-2.5 rounded-full bg-yellow-500/80" />
                    <span className="size-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-white/70">
                        {fileName}
                    </span>
                </div>
                <span className="font-mono text-[10px] uppercase text-white/50">
                    {language}
                </span>
            </div>

            <div className="flex">
                <div className="flex flex-col select-none border-r border-white/10 px-3 py-4 text-right font-mono text-xs text-white/70">
                    {lines.map((_, index) => (
                        <span key={index} className="leading-7">
                            {index + 1}
                        </span>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto p-4 font-mono text-sm leading-7 text-white sm:text-base">
                    {lines.map((line, lineIndex) => (
                        <div
                            key={lineIndex}
                            className="flex items-center whitespace-pre"
                        >
                            {renderLine(line, lineIndex)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
