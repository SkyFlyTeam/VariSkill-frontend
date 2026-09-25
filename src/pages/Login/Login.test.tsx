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
                name: /entrar/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByPlaceholderText("email@gmail.com"),
        ).toBeInTheDocument()

        expect(screen.getByPlaceholderText("**********")).toBeInTheDocument()

        expect(
            screen.getByRole("button", {
                name: /entrar/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("link", {
                name: /cadastre-se/i,
            }),
        ).toHaveAttribute("href", "/registro")
    })

    it("deve enviar email e senha para a API ao entrar", async () => {
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

        await user.type(
            screen.getByPlaceholderText("email@gmail.com"),
            "alice@example.com",
        )
        await user.type(screen.getByPlaceholderText("**********"), "secret")
        await user.click(screen.getByRole("button", { name: /entrar/i }))

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())

        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]

        expect(url).toBe("/api/login/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })
        expect(JSON.parse(options.body as string)).toEqual({
            email: "alice@example.com",
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

        await user.type(
            screen.getByPlaceholderText("email@gmail.com"),
            "alice@example.com",
        )
        await user.type(screen.getByPlaceholderText("**********"), "wrong")
        await user.click(screen.getByRole("button", { name: /entrar/i }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /email ou senha inválidos/i,
        )
    })
})
