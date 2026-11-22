import { useState } from "react"

import { ThumbsDown, ThumbsUp, Zap } from "lucide-react"

import { api } from "@/services/api"

type FeedbackStatus = "idle" | "sending" | "sent" | "error"

type InstantAnswerFeedbackProps = {
    duvidaId: string
    className?: string
}

export function InstantAnswerFeedback({
    duvidaId,
    className = "",
}: InstantAnswerFeedbackProps) {
    const [status, setStatus] = useState<FeedbackStatus>("idle")

    async function sendFeedback(util: boolean) {
        setStatus("sending")
        try {
            await api(
                `/chat/duvidas/${encodeURIComponent(duvidaId)}/feedback/`,
                { method: "POST", body: JSON.stringify({ util }) },
            )
            setStatus("sent")
        } catch {
            setStatus("error")
        }
    }

    const disabled = status === "sending"

    return (
        <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 ${className}`}
        >
            <span
                title="Resposta reaproveitada da base de conhecimento da Vari, sem consultar a IA externa."
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800"
            >
                <Zap aria-hidden="true" className="size-3 fill-current" />
                Resposta instantânea
            </span>

            {status === "sent" ? (
                <span role="status">Obrigado pelo feedback!</span>
            ) : (
                <span className="inline-flex items-center gap-1">
                    Esta resposta ajudou?
                    <button
                        type="button"
                        aria-label="Sim, a resposta ajudou"
                        disabled={disabled}
                        onClick={() => void sendFeedback(true)}
                        className="rounded-full p-1 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                    >
                        <ThumbsUp aria-hidden="true" className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Não, a resposta não ajudou"
                        disabled={disabled}
                        onClick={() => void sendFeedback(false)}
                        className="rounded-full p-1 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                        <ThumbsDown aria-hidden="true" className="size-3.5" />
                    </button>
                </span>
            )}

            {status === "error" && (
                <span role="alert" className="text-destructive">
                    Não foi possível enviar o feedback. Tente novamente.
                </span>
            )}
        </div>
    )
}
