import { fireEvent, render, screen } from "@testing-library/react"

import { LevelUpModal } from "./LevelUpModal"

function renderModal(props: Partial<Parameters<typeof LevelUpModal>[0]> = {}) {
    return render(<LevelUpModal open level={5} onClose={() => {}} {...props} />)
}

describe("LevelUpModal", () => {
    it("parabeniza com o novo nível, a arte do Vari e os confetes", () => {
        renderModal()

        expect(
            screen.getByRole("heading", {
                name: "Parabéns! Você alcançou o Nível 5!",
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("img", { name: /Vari comemorando/i }),
        ).toBeInTheDocument()
        expect(screen.getByTestId("level-up-confetti")).toBeInTheDocument()
    })

    it("mostra a progressão a partir do nível anterior informado pela API", () => {
        renderModal({ level: 4, previousLevel: 2 })

        expect(screen.getByText("Nível 2")).toBeInTheDocument()
        expect(screen.getByText("Nível 4")).toBeInTheDocument()
    })

    it("omite a progressão quando o nível anterior não é informado", () => {
        renderModal()

        expect(screen.queryByText("Nível 4")).not.toBeInTheDocument()
    })

    it("não renderiza nada quando fechado", () => {
        renderModal({ open: false })

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("fecha ao clicar em 'Continuar Aprendendo'", () => {
        const onClose = jest.fn()
        renderModal({ onClose })

        fireEvent.click(
            screen.getByRole("button", { name: "Continuar Aprendendo" }),
        )

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("fecha com a tecla Esc", () => {
        const onClose = jest.fn()
        renderModal({ onClose })

        fireEvent.keyDown(document.body, { key: "Escape" })

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
