import { X } from "lucide-react"

import { MarkdownViewer } from "@/components/shared/MarkdownViewer/MarkdownViewer"
import { NumberedCodeBlock } from "@/components/shared/NumberedCodeBlock/NumberedCodeBlock"
import { ProgressBar } from "@/components/shared/ProgressBar/ProgressBar"

export type LessonViewProps = {
    title: string
    body: string
    examples: string[][]
    progress: number
    onClose?: () => void
    onNext?: () => void
}

/**
 * Layout da tela de leitura teórica (frame "Lição"):
 * topo com "✕" + <ProgressBar /> cinza, card com título, texto,
 * "Exemplos:" em blocos numerados e o botão "Próximo".
 */
export function LessonView({
    title,
    body,
    examples,
    progress,
    onClose,
    onNext,
}: LessonViewProps) {
    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto flex max-w-[900px] flex-col gap-5">
                <header className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Sair da lição"
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-main-blue-dark transition-colors hover:bg-main-blue-dark/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-blue-dark"
                    >
                        <X className="size-5" />
                    </button>
                    <ProgressBar value={progress} className="h-2.5" />
                </header>

                <section className="rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
                    <h1 className="text-center text-xl font-bold tracking-tight sm:text-2xl">
                        {title}
                    </h1>

                    {body && (
                        <MarkdownViewer
                            content={body}
                            className="mt-6 text-sm text-slate-700"
                        />
                    )}

                    {examples.length > 0 && (
                        <div className="mt-8">
                            <p className="mb-3 text-sm font-bold">Exemplos:</p>
                            <div className="flex flex-col gap-4">
                                {examples.map((lines, index) => (
                                    <NumberedCodeBlock
                                        key={index}
                                        lines={lines}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex justify-center">
                        <button
                            type="button"
                            onClick={onNext}
                            className="h-auto min-w-[260px] cursor-pointer rounded-[10px] bg-main-blue px-[35px] py-[16px] text-[15px] leading-[100%] font-bold text-white transition-colors hover:bg-main-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-blue"
                        >
                            Próximo
                        </button>
                    </div>
                </section>
            </div>
        </main>
    )
}
