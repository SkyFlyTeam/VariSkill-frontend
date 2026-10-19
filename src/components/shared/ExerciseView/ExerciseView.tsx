import type { ReactNode } from "react"

import { X } from "lucide-react"

import { ProgressBar } from "@/components/shared/ProgressBar/ProgressBar"

export type ExerciseViewProps = {
    /** Enunciado em destaque (ex.: "1 - Arraste os blocos ...") */
    enunciado: string
    /** Indicador da etapa atual (ex.: "Questão 2 de 5") exibido acima do enunciado */
    stepLabel?: string
    /** Progresso (0..100) da barra no topo */
    progress?: number
    /** Texto do botão de ação */
    submitLabel?: string
    /** Desabilita o botão de ação (ex.: exercício ainda incompleto) */
    submitDisabled?: boolean
    /** Texto exibido enquanto a submissão está em andamento */
    submitting?: boolean
    onClose?: () => void
    onSubmit?: () => void
    /** Texto do botão secundário de voltar */
    backLabel?: string
    /** Quando informado, exibe o botão de voltar ao lado do botão de ação */
    onBack?: () => void
    /**
     * Área do exercício (editor de código + pílulas).
     * Vai receber o `<CodeBlocksQuestion />` da VAR-46 (ou outro tipo de questão).
     */
    children?: ReactNode
}

/**
 * Esqueleto da tela unificada de resolução de exercício (Wireframe 5):
 * topo com "✕" + <ProgressBar />, enunciado em destaque, a área do exercício
 * e o botão de ação. A área do exercício (editor/pílulas) entra depois (VAR-46).
 */
export function ExerciseView({
    enunciado,
    stepLabel,
    progress = 0,
    submitLabel = "Verificar",
    submitDisabled = false,
    submitting = false,
    onClose,
    onSubmit,
    backLabel = "Anterior",
    onBack,
    children,
}: ExerciseViewProps) {
    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto flex max-w-[900px] flex-col gap-5">
                <header className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Sair da atividade"
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-main-blue-dark transition-colors hover:bg-main-blue-dark/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-blue-dark"
                    >
                        <X className="size-5" />
                    </button>
                    <ProgressBar value={progress} className="h-2.5" />
                </header>

                <section className="rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
                    {stepLabel && (
                        <p className="mb-2 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            {stepLabel}
                        </p>
                    )}
                    <h1 className="text-center text-sm font-bold sm:text-base">
                        {enunciado}
                    </h1>

                    <div className="mt-8">
                        {children ?? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-400">
                                Área do exercício (editor de código + pílulas)
                                <br />— entra com o componente da VAR-46.
                            </div>
                        )}
                    </div>

                    <div className="mt-10 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={submitting}
                                className="h-auto min-w-40 cursor-pointer rounded-[10px] border border-main-blue px-[35px] py-[15px] text-[15px] leading-[100%] font-bold text-main-blue transition-colors hover:bg-main-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-blue disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {backLabel}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitDisabled || submitting}
                            className="h-auto min-w-[260px] cursor-pointer rounded-[10px] bg-main-blue px-[35px] py-[16px] text-[15px] leading-[100%] font-bold text-white transition-colors hover:bg-main-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-blue disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Enviando..." : submitLabel}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    )
}
