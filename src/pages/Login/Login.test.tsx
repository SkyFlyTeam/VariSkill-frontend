import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useAuth } from "@/contexts/authContext"
import { LoginPage } from "@/pages/Login/Login"
import { ApiError } from "@/services/api"
import { userService } from "@/services/userService"
import { renderWithProviders } from "@/tests/utils"

jest.mock("@/services/userService")
const service = jest.mocked(userService)
const profile = {
    id: "user-123",
    nome: "Ana",
    apelido: "ana",
    email: "ana@example.com",
    xp_total: 120,
    streak_dias: 3,
}
function SessionStatus() {
    const { user, loading } = useAuth()
    return (
        <p>
            {loading
                ? "Verificando"
                : user
                  ? `Autenticado: ${user.nome}`
                  : "Sem sessão"}
        </p>
    )
}
function renderLogin() {
    return renderWithProviders(
        <>
            <LoginPage />
            <SessionStatus />
        </>,
    )
}

beforeEach(() => {
    jest.resetAllMocks()
    service.getSession.mockRejectedValue(new ApiError("Sem sessão", 403))
})

it("renderiza login por apelido e senha", async () => {
    renderLogin()
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
    expect(screen.getByLabelText("Apelido")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
    expect(await screen.findByText("Sem sessão")).toBeInTheDocument()
})

it("autentica somente após o backend aceitar as credenciais", async () => {
    const user = userEvent.setup()
    service.login.mockResolvedValue(profile)
    renderLogin()
    await screen.findByText("Sem sessão")
    await user.type(screen.getByLabelText("Apelido"), "ana")
    await user.type(screen.getByLabelText("Senha"), "valid-password")
    await user.click(screen.getByRole("button", { name: "Entrar" }))
    expect(service.login).toHaveBeenCalledWith({
        apelido: "ana",
        password: "valid-password",
    })
    expect(await screen.findByText("Autenticado: Ana")).toBeInTheDocument()
})

it("mantém usuário desconectado e mostra credenciais inválidas", async () => {
    const user = userEvent.setup()
    service.login.mockRejectedValue(new ApiError("Invalid credentials.", 400))
    renderLogin()
    await screen.findByText("Sem sessão")
    await user.type(screen.getByLabelText("Apelido"), "ana")
    await user.type(screen.getByLabelText("Senha"), "wrong")
    await user.click(screen.getByRole("button", { name: "Entrar" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
        "Apelido ou senha incorretos.",
    )
    expect(screen.getByText("Sem sessão")).toBeInTheDocument()
})

it("restaura a sessão ao recarregar a aplicação", async () => {
    service.getSession.mockResolvedValue(profile)
    renderLogin()
    expect(await screen.findByText("Autenticado: Ana")).toBeInTheDocument()
    expect(service.login).not.toHaveBeenCalled()
})

it("diferencia indisponibilidade do servidor de sessão ausente", async () => {
    service.getSession.mockRejectedValue(new TypeError("Failed to fetch"))
    renderLogin()
    await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível conectar ao servidor",
        ),
    )
    expect(screen.getByText("Sem sessão")).toBeInTheDocument()
})
