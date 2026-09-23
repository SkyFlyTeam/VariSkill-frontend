import { useState } from "react"

import { ChatComposer } from "@/pages/Chat/components/ChatComposer"
import { ChatHeader } from "@/pages/Chat/components/ChatHeader"
import {
    type ChatMessage,
    MessageBubble,
} from "@/pages/Chat/components/MessageBubble"

const initialMessages: ChatMessage[] = [
    {
        id: "assistant-welcome",
        content: "Olá, em instantes irei te ajudar!",
        sender: "assistant",
    },
]

export function ChatPage() {
    const [messages, setMessages] = useState(initialMessages)

    function handleSend(content: string) {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: `user-${Date.now()}`,
                content,
                sender: "user",
            },
        ])
    }

    return (
        <main className="flex h-[calc(100svh-2.75rem)] min-h-0 flex-col overflow-hidden bg-[#e8ebef] px-3 py-5 text-slate-900 sm:h-svh sm:px-10 sm:py-6">
            <div className="mx-auto flex min-h-0 w-full flex-1 flex-col gap-5">
                <ChatHeader assistantName="Vari" status="online agora" />

                <section
                    aria-label="Conversa com Vari"
                    className="min-h-0 flex-1 overflow-y-auto px-1 py-8 sm:px-3 sm:py-12"
                >
                    <div className="flex flex-col gap-8">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                    </div>
                </section>

                <div className="shrink-0">
                    <ChatComposer onSend={handleSend} />
                </div>
            </div>
        </main>
    )
}
