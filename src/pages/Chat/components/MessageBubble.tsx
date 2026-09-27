import { useNavigate } from "react-router-dom"
import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"

export type ChatOption = {
    id: string
    titulo: string
}

export type ChatMessage = {
    id: string
    content: string
    sender: "assistant" | "user"
    options?: ChatOption[]
}

type MessageBubbleProps = {
    message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isAssistant = message.sender === "assistant"
    const navigate = useNavigate()

    if (isAssistant) {
        return (
            <div className="flex items-end gap-2.5">
                <ChatAvatar size="sm" />
                <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[70%]">
                    <p className="relative rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm whitespace-pre-line">
                        {message.content}
                    </p>
                    {message.options && message.options.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {message.options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => navigate(`/trilhas/${encodeURIComponent(opt.id)}`)}
                                    className="rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-semibold text-[#e91a36] shadow-sm hover:bg-rose-50 transition-colors"
                                >
                                    🎯 {opt.titulo}
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
