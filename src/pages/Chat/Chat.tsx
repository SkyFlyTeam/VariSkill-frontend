import { useEffect, useState } from "react"

import { ChatComposer } from "@/pages/Chat/components/ChatComposer"
import { ChatHeader } from "@/pages/Chat/components/ChatHeader"
import {
    type ChatMessage,
    MessageBubble,
} from "@/pages/Chat/components/MessageBubble"
import { api } from "@/services/api"

type SessaoResponse = {
    id: string
    mensagem_inicial?: string
}

type EnviarMensagemResponse = {
    resposta: string
    intencao?: string
    opcoes_trilhas?: { id: string; titulo: string }[]
}

export function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessaoId, setSessaoId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        api<SessaoResponse>("/chat/sessao/iniciar/", { method: "POST" })
            .then((sessao) => {
                if (!active) return
                setSessaoId(sessao.id)
                setMessages([
                    {
                        id: `assistant-${Date.now()}`,
                        content:
                            sessao.mensagem_inicial ||
                            "Olá! Sou a Vari, sua assistente virtual no VariSkill. Como posso te ajudar hoje?",
                        sender: "assistant",
                    },
                ])
            })
            .catch(() => {
                if (!active) return
                setMessages([
                    {
                        id: "assistant-fallback",
                        content:
                            "Olá! Não foi possível conectar com o assistente no momento. Tente novamente mais tarde.",
                        sender: "assistant",
                    },
                ])
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    async function handleSend(content: string) {
        const userMsgId = `user-${Date.now()}`
        setMessages((curr) => [
            ...curr,
            { id: userMsgId, content, sender: "user" },
        ])

        if (!sessaoId) return

        try {
            const resp = await api<EnviarMensagemResponse>(
                `/chat/sessao/${encodeURIComponent(sessaoId)}/mensagem/`,
                {
                    method: "POST",
                    body: JSON.stringify({ conteudo: content }),
                },
            )

            setMessages((curr) => [
                ...curr,
                {
                    id: `assistant-${Date.now()}`,
                    content: resp.resposta,
                    sender: "assistant",
                    options: resp.opcoes_trilhas,
                },
            ])
        } catch {
            setMessages((curr) => [
                ...curr,
                {
                    id: `assistant-err-${Date.now()}`,
                    content: "Ops, ocorreu um erro ao processar sua mensagem.",
                    sender: "assistant",
                },
            ])
        }
    }

    return (
        <main className="flex h-[calc(100svh-2.75rem)] min-h-0 flex-col overflow-hidden bg-[#e8ebef] px-3 py-5 text-slate-900 sm:h-svh sm:px-10 sm:py-6">
            <div className="mx-auto flex min-h-0 w-full flex-1 flex-col gap-5">
                <ChatHeader
                    assistantName="Vari"
                    status={loading ? "conectando..." : "online agora"}
                />

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
