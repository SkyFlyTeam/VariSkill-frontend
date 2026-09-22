import { fireEvent, render, screen } from "@testing-library/react"

import { ActivityNode } from "@/components/shared/ActivityNode/ActivityNode"

describe("ActivityNode", () => {
    it("deve renderizar o título e o ícone de teórico (livro)", () => {
        const { container } = render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="in_progress"
            />,
        )

        expect(screen.getByText("Variáveis")).toBeInTheDocument()
        expect(container.querySelector(".lucide-book-open")).toBeInTheDocument()
    })

    it("deve renderizar o ícone correto conforme o propósito", () => {
        const { container, rerender } = render(
            <ActivityNode
                title="Complete o código"
                purpose="practical"
                status="in_progress"
            />,
        )

        expect(container.querySelector(".lucide-file-code")).toBeInTheDocument()

        rerender(
            <ActivityNode
                title="Revisão da unidade"
                purpose="exam"
                status="in_progress"
            />,
        )

        expect(container.querySelector(".lucide-trophy")).toBeInTheDocument()
    })

    it("deve mostrar o cadeado cinza e não responder a clique quando bloqueado", () => {
        const onClick = jest.fn()

        const { container } = render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="locked"
                onClick={onClick}
            />,
        )

        expect(container.querySelector(".lucide-lock")).toBeInTheDocument()

        const node = screen.getByRole("button")

        expect(node).toBeDisabled()

        fireEvent.click(node)

        expect(onClick).not.toHaveBeenCalled()
    })

    it("deve mostrar o check verde quando concluído", () => {
        const { container } = render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="completed"
            />,
        )

        expect(container.querySelector(".lucide-check")).toBeInTheDocument()
    })

    it("deve destacar a borda quando em andamento", () => {
        render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="in_progress"
            />,
        )

        expect(screen.getByRole("button")).toHaveClass("border-sky-500")
    })

    it("deve chamar onClick quando a atividade está desbloqueada", () => {
        const onClick = jest.fn()

        render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="completed"
                onClick={onClick}
            />,
        )

        fireEvent.click(screen.getByRole("button"))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("deve mesclar a className externa", () => {
        const { container } = render(
            <ActivityNode
                title="Variáveis"
                purpose="theoretical"
                status="in_progress"
                className="minha-classe"
            />,
        )

        expect(container.firstElementChild).toHaveClass("minha-classe")
    })
})
