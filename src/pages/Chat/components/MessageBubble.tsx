import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { TrackRecommendationCard } from "@/components/shared/TrackRecommendationCard"
import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"
import { api } from "@/services/api"

export type ChatOption = {
    id: string
    titulo: string
    habilidade?: string
    motivo?: string
}

export type ChatAction = {
    label: string
    href: string
}

export type ChatMessage = {
    id: string
    content: string
    sender: "assistant" | "user"
    options?: ChatOption[]
    suggestions?: string[]
    action?: ChatAction
}

type MessageBubbleProps = {
    message: ChatMessage
    onSuggestionClick?: (suggestion: string) => void
    onStartTrack?: (trilhaId: string) => void | Promise<void>
}

export function MessageBubble({
    message,
    onSuggestionClick,
    onStartTrack,
}: MessageBubbleProps) {
    const isAssistant = message.sender === "assistant"
    const navigate = useNavigate()
    const [enrollingTrackId, setEnrollingTrackId] = useState<string | null>(null)

    async function handleStartTrack(trilhaId: string) {
        if (onStartTrack) {
            await onStartTrack(trilhaId)
            return
        }

        setEnrollingTrackId(trilhaId)
        try {
            await api("/matriculas/", {
                method: "POST",
                body: JSON.stringify({ trilha_id: trilhaId }),
            })
        } catch {
            // Se já matriculado ou erro, continua navegação para a trilha
        } finally {
            setEnrollingTrackId(null)
            navigate(`/trilhas/${encodeURIComponent(trilhaId)}`)
        }
    }

    if (isAssistant) {
        return (
            <div className="flex items-end gap-2.5">
                <ChatAvatar size="sm" />
                <div className="flex flex-col gap-2.5 max-w-[85%] sm:max-w-[70%]">
                    <p className="relative rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                    {message.options && message.options.length > 0 && (
                        <div className="flex flex-col gap-2.5 pt-1">
                            {message.options.map((opt) => (
                                <TrackRecommendationCard
                                    key={opt.id}
                                    id={opt.id}
                                    title={opt.titulo}
                                    skill={opt.habilidade || "Geral"}
                                    reason={opt.motivo}
                                    loading={enrollingTrackId === opt.id}
                                    onStartTrack={handleStartTrack}
                                    compact
                                />
                            ))}
                        </div>
                    )}
                    {message.action && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => navigate(message.action!.href)}
                                className="rounded-lg bg-[#e91a36] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#c9142d] transition-colors"
                            >
                                {message.action.label}
                            </button>
                        </div>
                    )}
                    {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {message.suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    disabled={!onSuggestionClick}
                                    onClick={() =>
                                        onSuggestionClick?.(suggestion)
                                    }
                                    className="rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-semibold text-[#e91a36] shadow-sm hover:bg-rose-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#48b7de] px-5 py-2.5 text-sm leading-relaxed text-white shadow-sm sm:max-w-[60%] whitespace-pre-line">
                {message.content}
            </p>
        </div>
    )
}
