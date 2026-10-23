import { screen } from "@testing-library/react"

import { TermosPage } from "@/pages/Termos/Termos"
import { renderWithProviders } from "@/tests/utils"

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

describe("TermosPage", () => {
    it("carrega e renderiza o markdown dos termos", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            text: async () =>
                "# Termos de Uso e Aviso de Privacidade — VariSkill\n\nConteúdo de teste.",
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        renderWithProviders(<TermosPage />)

        expect(
            await screen.findByRole("heading", {
                name: /Termos de Uso e Aviso de Privacidade/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText("Conteúdo de teste.")).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith("/docs/Termos_uso.md")
    })

    it("mostra erro quando o markdown não carrega", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: false,
            text: async () => "",
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        renderWithProviders(<TermosPage />)

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /não foi possível carregar/i,
        )
    })
})
