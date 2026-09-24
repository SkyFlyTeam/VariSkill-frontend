
const API_URL = import.meta.env.VITE_API_URL ?? "/api"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

function extractMessage(body: unknown): string | null {
    if (!body || typeof body !== "object") return null

    const data = body as Record<string, unknown>

    if (typeof data.detail === "string") return data.detail

    for (const value of Object.values(data)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
            return value[0]
        }
    }

    return null
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const method = (init.method ?? "GET").toUpperCase()
    const headers = new Headers(init.headers)
    headers.set("Content-Type", "application/json")

    // MOCK-TEMP-ADJACENT: o backend ainda não expõe a cookie csrftoken em
    // nenhuma resposta (sem @ensure_csrf_cookie nas views), então esse
    // header vai sair vazio até isso ser adicionado lá. O código já fica
    // pronto pro dia em que a cookie existir.
    if (UNSAFE_METHODS.has(method)) {
        const csrfToken = getCookie("csrftoken")
        if (csrfToken) headers.set("X-CSRFToken", csrfToken)
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        method,
        headers,
        credentials: "include",
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(
            extractMessage(body) ?? "Ocorreu um erro inesperado.",
            response.status,
        )
    }

    return response.status === 204 ? (undefined as T) : response.json()
}
