import { ApiError, api } from "@/services/api"
// MOCK-TEMP: só existe enquanto o backend não expõe estes dados. Ver o topo
// de mockProfile.ts para o que falta no backend, e remover junto com ele.
import { getMockProfile, updateMockProfile } from "@/services/mockProfile"

export type UserProfile = {
    id: string
    nome: string
    apelido: string
    email: string
    dataCadastro: string
    xpTotal: number
    diasOfensiva: number
}

export type UpdateProfileData = Pick<UserProfile, "nome" | "apelido">

export type ChangePasswordData = {
    senhaAtual: string
    novaSenha: string
}

// MOCK-TEMP: o login atual não cria sessão no backend. Em desenvolvimento,
// também usamos o mock quando falta sessão/endpoint ou o servidor/proxy falha.
function shouldUseMock(error: unknown) {
    if (!import.meta.env.DEV) return false
    if (!(error instanceof ApiError)) return true

    return (
        error.status === 401 ||
        error.status === 403 ||
        error.status === 404 ||
        (error.status >= 500 && error.status < 600)
    )
}

// MOCK-TEMP
function warnMock(message: string) {
    console.warn(
        `[mock dev] ${message} API indisponível ou sessão/endpoint ausente — remova src/services/mockProfile.ts quando a API real estiver pronta.`,
    )
}

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        try {
            return await api<UserProfile>("/users/me")
        } catch (error) {
            // MOCK-TEMP
            if (shouldUseMock(error)) {
                warnMock("Usando perfil fake.")
                return getMockProfile()
            }
            throw error
        }
    },

    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        try {
            return await api<UserProfile>("/users/me", {
                method: "PUT",
                body: JSON.stringify(data),
            })
        } catch (error) {
            // MOCK-TEMP
            if (shouldUseMock(error)) {
                warnMock("Perfil 'salvo' apenas localmente.")
                return updateMockProfile(data)
            }
            throw error
        }
    },

    changePassword: async (data: ChangePasswordData): Promise<void> => {
        try {
            await api<void>("/users/me/password", {
                method: "PUT",
                body: JSON.stringify(data),
            })
        } catch (error) {
            // MOCK-TEMP
            if (shouldUseMock(error)) {
                warnMock(
                    "Senha 'alterada' apenas localmente (nenhuma validação real).",
                )
                return
            }
            throw error
        }
    },
}
