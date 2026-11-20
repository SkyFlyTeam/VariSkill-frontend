import { fireEvent, render, screen } from "@testing-library/react"

import { ScrollAreaVari } from "./ScrollAreaVari"

afterEach(() => {
    jest.restoreAllMocks()
})

describe("ScrollAreaVari", () => {
    it("renderiza o conteúdo em uma região rotulada e esconde o scroll nativo", () => {
        render(
            <ScrollAreaVari label="Termos de uso">
                <p>Conteúdo dos termos</p>
            </ScrollAreaVari>,
        )

        const regiao = screen.getByRole("region", { name: "Termos de uso" })
        expect(regiao).toHaveClass("scrollbar-none")
        expect(screen.getByText("Conteúdo dos termos")).toBeInTheDocument()
    })

    it("não desenha o thumb quando o conteúdo cabe na área", () => {
        const { container } = render(
            <ScrollAreaVari label="Termos de uso">
                <p>Curto</p>
            </ScrollAreaVari>,
        )

        const trilho = container.querySelector('[aria-hidden="true"]')
        expect(trilho).toBeInTheDocument()
        expect(trilho?.querySelector("div")).toBeNull()
    })

    it("mostra o thumb vermelho quando o conteúdo é maior que a área", () => {
        jest.spyOn(
            HTMLElement.prototype,
            "scrollHeight",
            "get",
        ).mockReturnValue(1000)
        jest.spyOn(
            HTMLElement.prototype,
            "clientHeight",
            "get",
        ).mockReturnValue(200)

        const { container } = render(
            <ScrollAreaVari label="Termos de uso">
                <p>Conteúdo longo</p>
            </ScrollAreaVari>,
        )

        fireEvent.scroll(screen.getByRole("region", { name: "Termos de uso" }))

        const trilho = container.querySelector('[aria-hidden="true"]')
        const thumb = trilho?.querySelector("div")
        expect(thumb).toBeInTheDocument()
        expect(thumb).toHaveClass("bg-[#e11d2e]")
    })
})
