import { ApiError, api } from "@/services/api"
import type {
    ProgressoNivel,
    ResponsavelLegal,
    Streak,
} from "@/services/authService"

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
    streak: Streak
    sexo: "M" | "F" | null
    idade: number | null
    interesses: Interesse[]
    aceite_privacidade_versao?: string | null
    aceite_privacidade_em?: string | null
    consentimento_revogado_em?: string | null
    nivel?: number
    progresso_nivel?: ProgressoNivel
    responsavel?: ResponsavelLegal | null
    // Existe no modelo Django, mas ainda não é exposto pelo serializer atual.
    criado_em?: string
}

export type UpdateProfileData = Pick<
    UserProfile,
    "nome" | "apelido" | "sexo" | "idade"
> & {
    interesses_ids: string[]
}
/**
 * Contrato de `GET /users/me/diagnostico-pedagogico/` (VAR-126). Sem memória
 * consolidada, o backend responde 200 com as listas vazias.
 */
export type LearningDiagnostics = {
    pontos_fortes: string[]
    topicos_dificuldade: string[]
    taxa_acerto_geral: number
    total_atividades_avaliadas: number
    ultima_atualizacao: string | null
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

    getLearningDiagnostics: () =>
        api<LearningDiagnostics>("/users/me/diagnostico-pedagogico/"),

    updateProfile: (data: UpdateProfileData) =>
        api<UserProfile>("/users/me/", {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    changePassword: ({
        senhaAtual,
        novaSenha,
    }: ChangePasswordData): Promise<void> =>
        api<void>("/users/me/alterar-senha/", {
            method: "POST",
            body: JSON.stringify({
                senha_atual: senhaAtual,
                nova_senha: novaSenha,
            }),
        }),

    // Rota do DRF incluída em settings/urls.py; responde com HTML/redirect.
    logout: () => api<void>("/auth/logout/", { method: "POST" }),

    /**
     * Exportação self-service (VAR-124). O backend ignora qualquer e-mail
     * enviado e sempre devolve os dados do usuário autenticado.
     */
    async exportMyDataCsv(): Promise<Blob> {
        const response = await fetch("/api/users/me/exportar-csv/", {
            credentials: "include",
        })

        if (!response.ok) {
            throw new ApiError(
                "Não foi possível gerar a exportação dos seus dados.",
                response.status,
            )
        }

        return response.blob()
    },
}
