import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RegistroPage } from "@/pages/Registro/Registro"
import { renderWithProviders } from "@/tests/utils"

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

describe("RegistroPage", () => {
    it("deve renderizar a tela de registro", () => {
        renderWithProviders(<RegistroPage />)

        expect(
            screen.getByRole("heading", { name: /criar conta/i }),
        ).toBeInTheDocument()

        expect(screen.getByPlaceholderText("Nome Completo")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Apelido")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument()

        expect(
            screen.getByRole("button", { name: /cadastrar/i }),
        ).toBeInTheDocument()

        expect(screen.getByRole("link", { name: /entrar/i })).toHaveAttribute(
            "href",
            "/login",
        )
    })

    it("deve enviar os dados para a API ao cadastrar", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: async () => ({
                id: "1",
                apelido: "alice",
                nome: "Alice",
                email: "alice@example.com",
                xp_total: 0,
                streak_dias: 0,
            }),
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()

        renderWithProviders(<RegistroPage />)

        await user.type(screen.getByPlaceholderText("Nome Completo"), "Alice")
        await user.type(screen.getByPlaceholderText("Apelido"), "alice")
        await user.type(
            screen.getByPlaceholderText("Email"),
            "alice@example.com",
        )
        await user.type(screen.getByPlaceholderText("Senha"), "secret")
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())

        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]

        expect(url).toBe("/api/register/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })
        expect(JSON.parse(options.body as string)).toEqual({
            nome: "Alice",
            apelido: "alice",
            email: "alice@example.com",
            password: "secret",
        })
    })

    it("deve mostrar erro quando o cadastro falha", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({
                apelido: ["user with this apelido already exists."],
            }),
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()

        renderWithProviders(<RegistroPage />)

        await user.type(screen.getByPlaceholderText("Nome Completo"), "Alice")
        await user.type(screen.getByPlaceholderText("Apelido"), "alice")
        await user.type(
            screen.getByPlaceholderText("Email"),
            "alice@example.com",
        )
        await user.type(screen.getByPlaceholderText("Senha"), "secret")
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        expect(await screen.findByRole("alert")).toBeInTheDocument()
    })
})
