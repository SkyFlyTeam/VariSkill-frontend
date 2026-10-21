import { ApiError, api } from "@/services/api"

// Contrato de userManagement.serializers.UserSerializer.
export type Interesse = {
    id: string
    nome: string
}

export type UserProfile = {
    id: string
    nome: string
    apelido: string
    email: string
    xp_total: number
    streak_dias: number
    sexo: "M" | "F" | null
    idade: number | null
    interesses: Interesse[]
    // Existe no modelo Django, mas ainda não é exposto pelo serializer atual.
    criado_em?: string
}

export type UpdateProfileData = Pick<
    UserProfile,
    "nome" | "apelido" | "sexo" | "idade"
> & {
    interesses_ids: string[]
}
export type LoginData = { apelido: string; password: string }
export type ChangePasswordData = { senhaAtual: string; novaSenha: string }

export const userService = {
    login: (data: LoginData) =>
        api<UserProfile>("/login/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Esta action já existe no Backend local e identifica a sessão atual.
    getSession: () => api<UserProfile>("/users/me/"),

    getProfile: (id: string) =>
        api<UserProfile>(`/users/${encodeURIComponent(id)}/`),

    getInterests: () => api<Interesse[]>("/interesses/"),

    updateProfile: (data: UpdateProfileData) =>
        api<UserProfile>("/users/me/", {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    changePassword: async ({
        senhaAtual,
        novaSenha,
    }: ChangePasswordData): Promise<void> => {
        // O PATCH só recebe password. Confirmar a senha pelo login real antes
        // de alterar o usuário identificado pela sessão, sem confiar no formulário.
        const current = await userService.getSession()
        try {
            await userService.login({
                apelido: current.apelido,
                password: senhaAtual,
            })
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                throw new ApiError("Senha atual incorreta.", 400)
            }
            throw error
        }
        await api<UserProfile>(`/users/${encodeURIComponent(current.id)}/`, {
            method: "PATCH",
            body: JSON.stringify({ password: novaSenha }),
        })
        // set_password invalida a sessão no Django. A UI pede um novo login.
    },

    // Rota do DRF incluída em settings/urls.py; responde com HTML/redirect.
    logout: () => api<void>("/auth/logout/", { method: "POST" }),
}
