/** @jest-environment node */
import { ApiError } from "@/services/api"
import { userService } from "@/services/userService"

const profile = {
    id: "user-123",
    nome: "Ana",
    apelido: "ana",
    email: "ana@example.com",
    xp_total: 120,
    streak_dias: 3,
}
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
const originalFetch = globalThis.fetch
const cookieDocument = { cookie: "csrftoken=initial-token" }
const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    })

beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock
    cookieDocument.cookie = "csrftoken=initial-token"
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: cookieDocument,
    })
})
afterAll(() => {
    globalThis.fetch = originalFetch
    Reflect.deleteProperty(globalThis, "document")
})

it("lê o perfil pelo ID com campos literais do serializer", async () => {
    fetchMock.mockResolvedValue(json(profile))
    await expect(userService.getProfile(profile.id)).resolves.toEqual(profile)
    expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/user-123/",
        expect.objectContaining({ method: "GET", credentials: "include" }),
    )
})

it("atualiza nome e apelido com PATCH e token CSRF", async () => {
    const changes = { nome: "Ana Silva", apelido: "ana-silva" }
    fetchMock.mockResolvedValue(json({ ...profile, ...changes }))
    await userService.updateProfile(profile.id, changes)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/users/user-123/")
    expect(options).toMatchObject({
        method: "PATCH",
        body: JSON.stringify(changes),
        credentials: "include",
    })
    expect(new Headers(options?.headers).get("X-CSRFToken")).toBe(
        "initial-token",
    )
})

it("confirma senha atual antes do PATCH e usa o CSRF rotacionado no login", async () => {
    fetchMock
        .mockResolvedValueOnce(json(profile))
        .mockImplementationOnce(async () => {
            cookieDocument.cookie = "csrftoken=rotated-token"
            return json(profile)
        })
        .mockResolvedValueOnce(json(profile))
    await userService.changePassword({
        senhaAtual: "old-pass",
        novaSenha: "new-pass",
    })
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
        "/api/users/me/",
        "/api/login/",
        "/api/users/user-123/",
    ])
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify({ apelido: "ana", password: "old-pass" }),
    })
    const patch = fetchMock.mock.calls[2][1]
    expect(patch).toMatchObject({
        method: "PATCH",
        body: JSON.stringify({ password: "new-pass" }),
    })
    expect(new Headers(patch?.headers).get("X-CSRFToken")).toBe("rotated-token")
})

it("não envia PATCH se a senha atual estiver errada", async () => {
    fetchMock
        .mockResolvedValueOnce(json(profile))
        .mockResolvedValueOnce(json({ detail: "Invalid credentials." }, 400))
    await expect(
        userService.changePassword({
            senhaAtual: "wrong",
            novaSenha: "new-pass",
        }),
    ).rejects.toThrow("Senha atual incorreta.")
    expect(fetchMock).toHaveBeenCalledTimes(2)
})

it("propaga erro de validação do backend", async () => {
    fetchMock.mockResolvedValue(
        json({ apelido: ["Este apelido já existe."] }, 400),
    )
    await expect(
        userService.updateProfile(profile.id, {
            nome: "Ana",
            apelido: "duplicado",
        }),
    ).rejects.toThrow("Este apelido já existe.")
})

it.each([401, 403, 404, 500])(
    "não retorna mock para HTTP %s",
    async (status) => {
        fetchMock.mockResolvedValue(json({ detail: "Falha da API" }, status))
        await expect(userService.getProfile(profile.id)).rejects.toBeInstanceOf(
            ApiError,
        )
    },
)

it("propaga falhas de rede sem simular sucesso", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    await expect(
        userService.updateProfile(profile.id, { nome: "Ana", apelido: "ana" }),
    ).rejects.toThrow("Failed to fetch")
})

it("rejeita HTML devolvido no lugar de JSON do perfil", async () => {
    fetchMock.mockResolvedValue(
        new Response("<html>frontend</html>", {
            headers: { "Content-Type": "text/html" },
        }),
    )
    await expect(userService.getProfile(profile.id)).rejects.toThrow(
        "resposta inválida",
    )
})

it("encerra a sessão no endpoint DRF aceitando resposta HTML", async () => {
    fetchMock.mockResolvedValue(
        new Response("<html>logout</html>", {
            headers: { "Content-Type": "text/html" },
        }),
    )
    await expect(userService.logout()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/logout/",
        expect.objectContaining({ method: "POST", credentials: "include" }),
    )
})
