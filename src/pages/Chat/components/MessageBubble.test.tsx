import { render, screen } from "@testing-library/react"

import { MessageBubble } from "@/pages/Chat/components/MessageBubble"

describe("MessageBubble — origem da resposta", () => {
    it("mostra o selo de IA externa e o aviso de transferência internacional", () => {
        render(
            <MessageBubble
                message={{
                    id: "1",
                    sender: "assistant",
                    content: "Resposta externa",
                    origin: "IA_EXTERNA",
                }}
            />,
        )

        expect(screen.getByText("IA externa")).toBeInTheDocument()
        expect(
            screen.getByText(/pode ter sido transferida para fora do Brasil/i),
        ).toBeInTheDocument()
    })

    it("mostra PLN local sem aviso de transferência", () => {
        render(
            <MessageBubble
                message={{
                    id: "2",
                    sender: "assistant",
                    content: "Resposta local",
                    origin: "PLN_LOCAL",
                }}
            />,
        )

        expect(screen.getByText("PLN local")).toBeInTheDocument()
        expect(screen.queryByText(/fora do Brasil/i)).not.toBeInTheDocument()
    })

    it("não renderiza selo quando o backend não envia a origem", () => {
        render(
            <MessageBubble
                message={{
                    id: "3",
                    sender: "assistant",
                    content: "Sem origem",
                }}
            />,
        )

        expect(screen.queryByText("PLN local")).not.toBeInTheDocument()
        expect(screen.queryByText("Contingência")).not.toBeInTheDocument()
    })
})
