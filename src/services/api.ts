const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init.headers },
        credentials: "include",
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(
            body?.message ?? "Ocorreu um erro inesperado.",
            response.status,
        )
    }

    return response.status === 204 ? (undefined as T) : response.json()
}
