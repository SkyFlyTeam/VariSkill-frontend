import { MemoryRouter } from "react-router-dom"

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { PrivacyPage } from "@/pages/Privacy/Privacy"
import { userService } from "@/services/userService"

jest.mock("@/contexts/authContext", () => ({
    useAuth: () => ({ user: { email: "aluno@example.com" } }),
}))

const originalFetch = globalThis.fetch
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

afterEach(() => {
    globalThis.fetch = originalFetch
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    jest.restoreAllMocks()
})

function renderPrivacy() {
    return render(
        <MemoryRouter>
            <PrivacyPage />
        </MemoryRouter>,
    )
}

describe("PrivacyPage", () => {
    it("exporta o CSV com o e-mail do titular preenchido e travado", async () => {
        const csv = new Blob(["secao,registro_id,campo,valor"], {
            type: "text/csv",
        })
        const exportSpy = jest
            .spyOn(userService, "exportMyDataCsv")
            .mockResolvedValue(csv)
        URL.createObjectURL = jest.fn(() => "blob:teste")
        URL.revokeObjectURL = jest.fn()
        const clickSpy = jest
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {})

        renderPrivacy()

        const email = screen.getByLabelText("E-mail da conta")
        expect(email).toHaveValue("aluno@example.com")
        expect(email).toHaveAttribute("readonly")

        fireEvent.click(
            screen.getByRole("button", { name: /baixar meus dados/i }),
        )

        await waitFor(() => expect(exportSpy).toHaveBeenCalledTimes(1))
        await screen.findByRole("status")
        expect(clickSpy).toHaveBeenCalled()
        expect(URL.createObjectURL).toHaveBeenCalledWith(csv)
    })

    it("mostra o contato de privacidade na aba de revogação", () => {
        renderPrivacy()

        fireEvent.click(screen.getByRole("tab", { name: /revogar dados/i }))

        const link = screen.getByRole("link", {
            name: /skyfly.organization@gmail.com/i,
        })
        expect(link).toHaveAttribute(
            "href",
            expect.stringContaining("mailto:skyfly.organization@gmail.com"),
        )
        expect(
            screen.getByText(/entre em contato pelo nosso e-mail/i),
        ).toBeInTheDocument()
    })

    it("carrega os termos oficiais na aba de termos", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            text: async () =>
                "# Termos de Uso e Aviso de Privacidade — VariSkill\n\nVersão de teste.",
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        renderPrivacy()

        fireEvent.click(screen.getByRole("tab", { name: /termos de aceite/i }))

        expect(
            await screen.findByRole("heading", {
                name: /Termos de Uso e Aviso de Privacidade/i,
            }),
        ).toBeInTheDocument()
        expect(await screen.findByText("Versão de teste.")).toBeInTheDocument()
        expect(screen.getByText(/Versão 1\.1/)).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith("/docs/Termos_uso.md")
    })
})
