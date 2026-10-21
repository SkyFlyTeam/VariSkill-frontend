import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ProfilePage } from "@/pages/Profile/Profile"
import { userService } from "@/services/userService"

const mockAuth = { updateUser: jest.fn() }
const mockToast = { success: jest.fn(), error: jest.fn() }

jest.mock("@/contexts/authContext", () => ({
    useAuth: () => ({
        user: {
            id: "user-1",
            nome: "Ana",
            apelido: "ana",
            email: "ana@example.com",
            xp_total: 10,
            streak_dias: 1,
        },
        updateUser: mockAuth.updateUser,
    }),
}))

jest.mock("@/components/shared/toast", () => ({
    useToast: () => ({
        success: mockToast.success,
        error: mockToast.error,
    }),
}))

jest.mock("@/services/userService", () => ({
    userService: {
        getSession: jest.fn(),
        getInterests: jest.fn(),
        updateProfile: jest.fn(),
    },
}))

const mockGetSession = jest.mocked(userService.getSession)
const mockGetInterests = jest.mocked(userService.getInterests)
const mockUpdateProfile = jest.mocked(userService.updateProfile)
const mockUpdateUser = mockAuth.updateUser
const mockToastSuccess = mockToast.success
const mockToastError = mockToast.error

const profile = {
    id: "user-1",
    nome: "Ana",
    apelido: "ana",
    email: "ana@example.com",
    xp_total: 10,
    streak_dias: 1,
    sexo: null,
    idade: null,
    interesses: [],
}

const interesses = [
    { id: "interesse-1", nome: "Python" },
    { id: "interesse-2", nome: "Dados" },
]

beforeEach(() => {
    jest.clearAllMocks()
    mockGetSession.mockResolvedValue(profile)
    mockGetInterests.mockResolvedValue(interesses)
})

describe("ProfilePage", () => {
    it("carrega perfil e interesses dinamicamente", async () => {
        render(<ProfilePage />)

        expect(await screen.findByDisplayValue("Ana")).toBeInTheDocument()
        expect(screen.getByLabelText("Sexo")).toBeInTheDocument()
        expect(screen.getByLabelText("Idade")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Python" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Dados" }),
        ).toBeInTheDocument()
        expect(mockGetInterests).toHaveBeenCalled()
    })

    it("salva sexo, idade e interesses via /users/me/ e atualiza o AuthContext", async () => {
        const updated = {
            ...profile,
            sexo: "F" as const,
            idade: 25,
            interesses: [interesses[0]],
        }
        mockUpdateProfile.mockResolvedValue(updated)
        const user = userEvent.setup()

        render(<ProfilePage />)

        await screen.findByRole("button", { name: "Python" })
        await user.selectOptions(screen.getByLabelText("Sexo"), "F")
        await user.type(screen.getByLabelText("Idade"), "25")
        await user.click(screen.getByRole("button", { name: "Python" }))
        await user.click(screen.getByRole("button", { name: "Salvar" }))

        await waitFor(() =>
            expect(mockUpdateProfile).toHaveBeenCalledWith({
                nome: "Ana",
                apelido: "ana",
                sexo: "F",
                idade: 25,
                interesses_ids: ["interesse-1"],
            }),
        )
        expect(mockUpdateUser).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "user-1",
                sexo: "F",
                idade: 25,
            }),
        )
        expect(mockToastSuccess).toHaveBeenCalledWith(
            "Perfil atualizado com sucesso!",
        )
    })

    it("bloqueia idade fora de 10 a 120", async () => {
        const user = userEvent.setup()
        render(<ProfilePage />)

        await screen.findByRole("button", { name: "Python" })
        const idadeInput = screen.getByLabelText("Idade")
        await user.clear(idadeInput)
        await user.type(idadeInput, "9abc")
        expect(idadeInput).toHaveValue("9")
        const salvar = screen.getByRole("button", { name: "Salvar" })
        expect(salvar).toBeEnabled()
        await user.click(salvar)

        await waitFor(() =>
            expect(mockToastError).toHaveBeenCalledWith(
                "A idade deve estar entre 10 e 120 anos.",
            ),
        )
        expect(mockUpdateProfile).not.toHaveBeenCalled()
    })
})
