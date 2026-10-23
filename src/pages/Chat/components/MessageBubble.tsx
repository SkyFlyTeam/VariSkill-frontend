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
}

type MessageBubbleProps = {
    message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
    if (message.sender === "assistant") {
        return (
            <div className="flex items-end gap-2.5">
                <ChatAvatar size="sm" />
                <p className="relative max-w-[85%] rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words sm:max-w-[70%]">
                    {message.content}
                </p>
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
