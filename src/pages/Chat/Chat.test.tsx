import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ChatPage } from "@/pages/Chat/Chat"
import { renderWithProviders } from "@/tests/utils"

describe("ChatPage", () => {
    it("deve renderizar o cabeçalho e a mensagem inicial", () => {
        renderWithProviders(<ChatPage />)

        expect(
            screen.getByRole("heading", {
                name: "Vari",
            }),
        ).toBeInTheDocument()

        expect(screen.getByText("online agora")).toBeInTheDocument()
        expect(
            screen.getByText("Olá, em instantes irei te ajudar!"),
        ).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Digite sua dúvida...")).toBeInTheDocument()
    })

    it("deve adicionar uma mensagem enviada pelo usuário", async () => {
        const user = userEvent.setup()
        renderWithProviders(<ChatPage />)

        const messageInput = screen.getByPlaceholderText("Digite sua dúvida...")
        const sendButton = screen.getByRole("button", {
            name: "Enviar mensagem",
        })

        await user.type(messageInput, "Tenho uma dúvida sobre a seção 3")
        await user.click(sendButton)

        expect(
            screen.getByText("Tenho uma dúvida sobre a seção 3"),
        ).toBeInTheDocument()
        expect(messageInput).toHaveValue("")
    })
})