import { InstantAnswerFeedback } from "@/components/shared/InstantAnswerFeedback/InstantAnswerFeedback"
import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"

export type ChatAction = {
    label: string
    href: string
}

export type ChatTrack = {
    id: string
    titulo: string
    gerada_por_ia?: boolean
}

export type ChatMessage = {
    id: string
    content: string
    sender: "assistant" | "user"
    // Ação, trilhas e sugestões são renderizadas como quick chips no rodapé do chat, não dentro do balão.
    suggestions?: string[]
    action?: ChatAction
    tracks?: ChatTrack[]
    // Id da dúvida assimilada quando a resposta veio do cache semântico (resposta instantânea).
    instantAnswerId?: string
    /** Origem da resposta (VAR-124): PLN_LOCAL | IA_EXTERNA | CONTINGENCIA. */
    origin?: "PLN_LOCAL" | "IA_EXTERNA" | "CONTINGENCIA"
}

const ORIGIN_LABEL: Record<NonNullable<ChatMessage["origin"]>, string> = {
    PLN_LOCAL: "PLN local",
    IA_EXTERNA: "IA generativa",
    CONTINGENCIA: "Contingência",
}

type MessageBubbleProps = {
    message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
    if (message.sender === "assistant") {
        return (
            <div className="flex flex-col gap-1.5">
                <div className="flex items-end gap-2.5">
                    <ChatAvatar size="sm" />
                    <p className="relative max-w-[85%] rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words sm:max-w-[70%]">
                        {message.content}
                    </p>
                </div>
                {message.instantAnswerId && (
                    // Alinha com o balão: largura do avatar (size-10) + gap-2.5.
                    <InstantAnswerFeedback
                        duvidaId={message.instantAnswerId}
                        className="pl-[3.125rem]"
                    />
                )}
                {(message.origin && message.origin !== "PLN_LOCAL") && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 px-1 text-[11px] leading-snug text-slate-600">
                        <span className="rounded-full bg-white/80 px-2 py-0.5 font-bold text-slate-700">
                            {ORIGIN_LABEL[message.origin]}
                        </span>
                        {message.origin === "IA_EXTERNA" && (
                            <span>
                                Resposta processada por IA generativa; a
                                pergunta pode ter sido transferida para fora
                                do Brasil.
                            </span>
                        )}
                    </div>
                )}
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
