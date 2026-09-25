import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useAuth } from "@/contexts/authContext"
import { LoginPage } from "@/pages/Login/Login"
import { ApiError } from "@/services/api"
import { userService } from "@/services/userService"
import { renderWithProviders } from "@/tests/utils"

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

describe("LoginPage", () => {
    it("deve renderizar a tela de login", () => {
        renderWithProviders(<LoginPage />)

        expect(
            screen.getByRole("heading", {
                name: /login/i,
            }),
        ).toBeInTheDocument()

        expect(screen.getByPlaceholderText("Seu apelido")).toBeInTheDocument()

        expect(screen.getByPlaceholderText("Sua senha")).toBeInTheDocument()

        expect(
            screen.getByRole("button", {
                name: /entrar/i,
            }),
        ).toBeInTheDocument()
    })

    it("deve enviar apelido e senha para a API ao entrar", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
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

        renderWithProviders(<LoginPage />)

        await user.type(screen.getByPlaceholderText("Seu apelido"), "alice")
        await user.type(screen.getByPlaceholderText("Sua senha"), "secret")
        await user.click(screen.getByRole("button", { name: /entrar/i }))

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())

        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]

        expect(url).toBe("/api/login/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })
        expect(JSON.parse(options.body as string)).toEqual({
            apelido: "alice",
            password: "secret",
        })
    })

    it("deve mostrar erro quando as credenciais são inválidas", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ detail: "Invalid credentials." }),
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()

        renderWithProviders(<LoginPage />)

        await user.type(screen.getByPlaceholderText("Seu apelido"), "alice")
        await user.type(screen.getByPlaceholderText("Sua senha"), "wrong")
        await user.click(screen.getByRole("button", { name: /entrar/i }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /apelido ou senha inválidos/i,
        )
    })
})
