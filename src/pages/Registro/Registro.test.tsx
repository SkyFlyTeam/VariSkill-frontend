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
            screen.getByRole("heading", { name: /cadastrar/i }),
        ).toBeInTheDocument()

        expect(screen.getByPlaceholderText("Joe Doe")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("joe.doe")).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText("email@gmail.com"),
        ).toBeInTheDocument()
        expect(screen.getByPlaceholderText("**********")).toBeInTheDocument()

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
                apelido: "joe.doe",
                nome: "Joe Doe",
                email: "joe@example.com",
                xp_total: 0,
                streak_dias: 0,
            }),
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()

        renderWithProviders(<RegistroPage />)

        await user.type(screen.getByPlaceholderText("Joe Doe"), "Joe Doe")
        await user.type(screen.getByPlaceholderText("joe.doe"), "joe.doe")
        await user.type(
            screen.getByPlaceholderText("email@gmail.com"),
            "joe@example.com",
        )
        await user.type(screen.getByPlaceholderText("**********"), "secret")
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(([url]) => url === "/api/register/"),
            ).toBe(true),
        )

        const [url, options] = fetchMock.mock.calls.find(
            ([url]) => url === "/api/register/",
        ) as [string, RequestInit]

        expect(url).toBe("/api/register/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })
        expect(JSON.parse(options.body as string)).toEqual({
            nome: "Joe Doe",
            apelido: "joe.doe",
            email: "joe@example.com",
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

        await user.type(screen.getByPlaceholderText("Joe Doe"), "Joe Doe")
        await user.type(screen.getByPlaceholderText("joe.doe"), "joe.doe")
        await user.type(
            screen.getByPlaceholderText("email@gmail.com"),
            "joe@example.com",
        )
        await user.type(screen.getByPlaceholderText("**********"), "secret")
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        expect(await screen.findByRole("alert")).toBeInTheDocument()
    })
})
