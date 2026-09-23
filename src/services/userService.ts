import { api } from "@/services/api"

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

export const userService = {
    getProfile: () => api<UserProfile>("/users/me"),

    updateProfile: (data: UpdateProfileData) =>
        api<UserProfile>("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    changePassword: (data: ChangePasswordData) =>
        api<void>("/users/me/password", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
}
