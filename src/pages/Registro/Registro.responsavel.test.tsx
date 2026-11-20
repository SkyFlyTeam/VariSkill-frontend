import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RegistroPage } from "@/pages/Registro/Registro"
import { renderWithProviders } from "@/tests/utils"

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

async function preencherDadosBasicos(
    user: ReturnType<typeof userEvent.setup>,
    idade: string,
) {
    await user.type(screen.getByPlaceholderText("Joe Doe"), "Ana Menor")
    await user.type(screen.getByPlaceholderText("joe.doe"), "ana.menor")
    await user.type(
        screen.getByPlaceholderText("email@gmail.com"),
        "ana@example.com",
    )
    await user.type(screen.getByPlaceholderText("**********"), "secret123")
    await user.type(screen.getByLabelText("Idade"), idade)
    await user.selectOptions(screen.getByLabelText("Sexo"), "F")
}

describe("RegistroPage — responsável legal", () => {
    it("abre a seção de responsável apenas para menores de 18", async () => {
        const user = userEvent.setup()
        renderWithProviders(<RegistroPage />)

        await user.type(screen.getByLabelText("Idade"), "16")

        expect(
            screen.getByRole("heading", { name: "Dados do Responsável" }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText("CPF do responsável")).toBeInTheDocument()

        await user.clear(screen.getByLabelText("Idade"))
        await user.type(screen.getByLabelText("Idade"), "21")

        expect(
            screen.queryByRole("heading", { name: "Dados do Responsável" }),
        ).not.toBeInTheDocument()
    })

    it("bloqueia o cadastro de menor com CPF inválido", async () => {
        const fetchMock = jest.fn()
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()
        renderWithProviders(<RegistroPage />)

        await preencherDadosBasicos(user, "16")
        await user.type(
            screen.getByLabelText("Nome do responsável"),
            "Maria Responsável",
        )
        await user.type(
            screen.getByLabelText("CPF do responsável"),
            "11111111111",
        )
        await user.type(
            screen.getByLabelText("E-mail do responsável"),
            "maria@example.com",
        )
        await user.click(screen.getByRole("checkbox"))
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        expect(await screen.findByText("CPF inválido.")).toBeInTheDocument()
        expect(
            fetchMock.mock.calls.some(([url]) => url === "/api/register/"),
        ).toBe(false)
    })

    it("envia os dados do responsável (CPF sem máscara) no cadastro do menor", async () => {
        const fetchMock = jest.fn().mockImplementation((url: string) => {
            if (url === "/api/users/me/") {
                return Promise.resolve({
                    ok: false,
                    status: 401,
                    json: async () => ({}),
                })
            }
            return Promise.resolve({
                ok: true,
                status: 201,
                json: async () => ({
                    id: "1",
                    apelido: "ana.menor",
                    nome: "Ana Menor",
                    email: "ana@example.com",
                    xp_total: 0,
                    streak: {
                        atual: 0,
                        recorde: 0,
                        concluiu_hoje: false,
                        ultimo_dia: null,
                    },
                }),
            })
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()
        renderWithProviders(<RegistroPage />)

        await preencherDadosBasicos(user, "16")
        await user.type(
            screen.getByLabelText("Nome do responsável"),
            "Maria Responsável",
        )
        await user.type(
            screen.getByLabelText("CPF do responsável"),
            "52998224725",
        )
        await user.type(
            screen.getByLabelText("E-mail do responsável"),
            "maria@example.com",
        )
        await user.click(screen.getByRole("checkbox"))
        await user.click(screen.getByRole("button", { name: /cadastrar/i }))

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(([url]) => url === "/api/register/"),
            ).toBe(true),
        )

        const [, options] = fetchMock.mock.calls.find(
            ([url]) => url === "/api/register/",
        ) as [string, RequestInit]

        expect(JSON.parse(options.body as string)).toMatchObject({
            idade: 16,
            responsavel: {
                nome: "Maria Responsável",
                cpf: "52998224725",
                email: "maria@example.com",
            },
        })
    })
})
