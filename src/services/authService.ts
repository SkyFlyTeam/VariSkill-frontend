import { http } from "@/services/http"

export type User = {
    id: string
    apelido: string
    nome: string
    email: string
    xp_total: number
    streak_dias: number
}

export type RegisterPayload = {
    apelido: string
    nome: string
    email: string
    password: string
}

export function login(email: string, password: string) {
    return http<User>("/api/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    })
}

export function register(payload: RegisterPayload) {
    return http<User>("/api/register/", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export function logout() {
    return http<void>("/api/logout/", { method: "POST" })
}

export function me() {
    return http<User>("/api/users/me/")
}
