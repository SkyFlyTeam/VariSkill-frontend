import { useState } from "react"

import { fireEvent, render, screen } from "@testing-library/react"

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
        render(<ControlledModal defaultOpen={false} />)

        expect(screen.queryByText("Seja bem-vindo!")).not.toBeInTheDocument()
    })

    it("exibe o mascote, o nome Vari e a mensagem quando aberto", () => {
        render(<ControlledModal />)

        expect(
            screen.getByRole("img", { name: /vari, o mascote/i }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("heading", { name: "Vari" }),
        ).toBeInTheDocument()

        expect(screen.getByText("Seja bem-vindo!")).toBeInTheDocument()
    })

    it("usa 'Entendi!' como rótulo padrão do botão de ação", () => {
        render(<ControlledModal />)

        expect(
            screen.getByRole("button", { name: "Entendi!" }),
        ).toBeInTheDocument()
    })

    it("aceita um título customizado", () => {
        render(
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
        render(<ControlledModal onAction={handleAction} />)

        fireEvent.click(screen.getByRole("button", { name: "Entendi!" }))

        expect(handleAction).toHaveBeenCalledTimes(1)
        expect(screen.queryByText("Seja bem-vindo!")).not.toBeInTheDocument()
    })

    it("tem overlay escurecendo o fundo", () => {
        const { baseElement } = render(<ControlledModal />)

        expect(
            baseElement.querySelector('[data-slot="dialog-overlay"]'),
        ).toBeInTheDocument()
    })

    it("não exibe dots de progresso nem ação secundária por padrão", () => {
        render(<ControlledModal />)

        expect(screen.queryByRole("tab")).not.toBeInTheDocument()
    })

    it("exibe dots de progresso quando stepIndicator é informado", () => {
        render(
            <VariMessageModal
                open
                onOpenChange={() => {}}
                message="Etapa 2"
                stepIndicator={{ current: 2, total: 4 }}
            />,
        )

        expect(screen.getAllByRole("tab")).toHaveLength(4)
        expect(
            screen.getByRole("tab", { name: "Etapa 2 de 4" }),
        ).toHaveAttribute("aria-selected", "true")
    })

    it("exibe e aciona a ação secundária quando informada", () => {
        const handleSkip = jest.fn()
        render(
            <VariMessageModal
                open
                onOpenChange={() => {}}
                message="Etapa 1"
                secondaryAction={{ label: "Pular tour", onClick: handleSkip }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Pular tour" }))

        expect(handleSkip).toHaveBeenCalledTimes(1)
    })
    it("usa o mascote padrão e não renderiza conteúdo extra por padrão", () => {
        renderWithProviders(<ControlledModal />)

        expect(
            screen.getByRole("img", { name: /vari, o mascote/i }),
        ).toBeInTheDocument()
    })

    it("aceita uma arte customizada do mascote", () => {
        renderWithProviders(
            <VariMessageModal
                open
                onOpenChange={() => {}}
                message="Resultado"
                illustration={{ src: "arte.svg", alt: "Vari comemorando" }}
            />,
        )

        expect(
            screen.getByRole("img", { name: "Vari comemorando" }),
        ).toHaveAttribute("src", "arte.svg")
        expect(
            screen.queryByRole("img", { name: /vari, o mascote/i }),
        ).not.toBeInTheDocument()
    })

    it("renderiza children entre o texto e o botão de ação", () => {
        renderWithProviders(
            <VariMessageModal open onOpenChange={() => {}} message="Texto">
                <p>Conteúdo extra</p>
            </VariMessageModal>,
        )

        expect(screen.getByText("Conteúdo extra")).toBeInTheDocument()
    })
})
