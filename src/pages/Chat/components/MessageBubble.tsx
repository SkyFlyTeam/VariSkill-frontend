import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"

export type ChatMessage = {
    id: string
    content: string
    sender: "assistant" | "user"
}

type MessageBubbleProps = {
    message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isAssistant = message.sender === "assistant"

    if (isAssistant) {
        return (
            <div className="flex items-end gap-2.5">
                <ChatAvatar size="sm" />
                <p className="relative max-w-[80%] rounded-2xl rounded-bl-sm bg-[#e91a36] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm sm:max-w-[60%]">
                    {message.content}
                </p>
            </div>
        )
    }

    return (
        <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#48b7de] px-5 py-2.5 text-sm leading-relaxed text-white shadow-sm sm:max-w-[60%]">
                {message.content}
            </p>
        </div>
    )
}
