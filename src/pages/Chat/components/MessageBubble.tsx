import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"

export type ChatAction = {
    label: string
    href: string
}

export type ChatTrack = {
    id: string
    titulo: string
}

export type ChatMessage = {
    id: string
    content: string
    sender: "assistant" | "user"
    // Ação, trilhas e sugestões são renderizadas como quick chips no rodapé do chat, não dentro do balão.
    suggestions?: string[]
    action?: ChatAction
    tracks?: ChatTrack[]
    /** Origem da resposta (VAR-124): PLN_LOCAL | IA_EXTERNA | CONTINGENCIA. */
    origin?: "PLN_LOCAL" | "IA_EXTERNA" | "CONTINGENCIA"
}

const ORIGIN_LABEL: Record<NonNullable<ChatMessage["origin"]>, string> = {
    PLN_LOCAL: "PLN local",
    IA_EXTERNA: "IA externa",
    CONTINGENCIA: "Contingência",
}

type MessageBubbleProps = {
    message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
    if (message.sender === "assistant") {
        return (
            <div className="flex items-end gap-2.5">
                <ChatAvatar size="sm" />
                <div className="max-w-[85%] sm:max-w-[70%]">
                    <p className="relative rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                    {message.origin && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 px-1 text-[11px] leading-snug text-slate-600">
                            <span className="rounded-full bg-white/80 px-2 py-0.5 font-bold text-slate-700">
                                {ORIGIN_LABEL[message.origin]}
                            </span>
                            {message.origin === "IA_EXTERNA" && (
                                <span>
                                    Resposta processada por IA externa; a
                                    pergunta pode ter sido transferida para fora
                                    do Brasil.
                                </span>
                            )}
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
