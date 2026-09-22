import { useState } from "react"

import { fireEvent, screen } from "@testing-library/react"

import { renderWithProviders } from "@/tests/utils"

import { VariMessageModal } from "./VariMessageModal"

function ControlledModal({
    onAction,
    defaultOpen = true,
}: {
    onAction?: () => void
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <VariMessageModal
            open={open}
            onOpenChange={setOpen}
            message="Seja bem-vindo!"
            onAction={onAction}
        />
    )
}

describe("VariMessageModal", () => {
    it("não renderiza nada quando fechado", () => {
        renderWithProviders(<ControlledModal defaultOpen={false} />)

        expect(screen.queryByText("Seja bem-vindo!")).not.toBeInTheDocument()
    })

    it("exibe o mascote, o nome Vari e a mensagem quando aberto", () => {
        renderWithProviders(<ControlledModal />)

        expect(
            screen.getByRole("img", { name: /vari, o mascote/i }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("heading", { name: "Vari" }),
        ).toBeInTheDocument()

        expect(screen.getByText("Seja bem-vindo!")).toBeInTheDocument()
    })

    it("usa 'Entendi!' como rótulo padrão do botão de ação", () => {
        renderWithProviders(<ControlledModal />)

        expect(
            screen.getByRole("button", { name: "Entendi!" }),
        ).toBeInTheDocument()
    })

    it("aceita um título customizado", () => {
        renderWithProviders(
            <VariMessageModal
                open
                onOpenChange={() => {}}
                title="Dica"
                message="Use as setas para navegar."
            />,
        )

        expect(
            screen.getByRole("heading", { name: "Dica" }),
        ).toBeInTheDocument()
    })

    it("fecha o modal e chama onAction ao clicar no botão", () => {
        const handleAction = jest.fn()
        renderWithProviders(<ControlledModal onAction={handleAction} />)

        fireEvent.click(screen.getByRole("button", { name: "Entendi!" }))

        expect(handleAction).toHaveBeenCalledTimes(1)
        expect(screen.queryByText("Seja bem-vindo!")).not.toBeInTheDocument()
    })

    it("tem overlay escurecendo o fundo", () => {
        const { baseElement } = renderWithProviders(<ControlledModal />)

        expect(
            baseElement.querySelector('[data-slot="dialog-overlay"]'),
        ).toBeInTheDocument()
    })
})
