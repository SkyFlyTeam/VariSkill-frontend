import { MemoryRouter, Route, Routes } from "react-router-dom"

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { AuthProvider } from "@/contexts/authContext"

import { OnboardingPage } from "./Onboarding"

const originalFetch = globalThis.fetch

const BASE_USER = {
    id: "1",
    apelido: "alice",
    nome: "Alice",
    email: "alice@example.com",
    xp_total: 0,
    streak_dias: 0,
    is_primeiro_acesso: true,
}

function mockFetch(user = BASE_USER) {
    const fetchMock = jest
        .fn()
        .mockImplementation((url: string, options?: RequestInit) => {
            if (url === "/api/users/me/" && options?.method === "PATCH") {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: async () => ({ ...user, is_primeiro_acesso: false }),
                })
            }

            return Promise.resolve({
                ok: true,
                status: 200,
                json: async () => user,
            })
        })

    globalThis.fetch = fetchMock as unknown as typeof fetch

    return fetchMock
}

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

function renderOnboarding() {
    return render(
        <MemoryRouter initialEntries={["/onboarding"]}>
            <AuthProvider>
                <Routes>
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/" element={<div>Home stub</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>,
    )
}

describe("OnboardingPage", () => {
    it("abre a primeira etapa automaticamente com indicador 1 de 4", async () => {
        mockFetch()

        renderOnboarding()

        expect(
            await screen.findByRole("heading", {
                name: "Bem-vindo ao VariSkill!",
            }),
        ).toBeInTheDocument()
        expect(screen.getAllByRole("tab")).toHaveLength(4)
        expect(
            screen.getByRole("tab", { name: "Etapa 1 de 4" }),
        ).toHaveAttribute("aria-selected", "true")
    })

    it("avança pelas 4 etapas e conclui o onboarding no backend", async () => {
        const fetchMock = mockFetch()

        renderOnboarding()

        await screen.findByRole("heading", { name: "Bem-vindo ao VariSkill!" })

        fireEvent.click(
            screen.getByRole("button", { name: "Conhecer a plataforma" }),
        )
        expect(
            screen.getByRole("heading", { name: "Seu aprendizado em Trilhas" }),
        ).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole("button", { name: "Continuar" })[0])
        expect(
            screen.getByRole("heading", {
                name: "Aprenda praticando e ganhe recompensas!",
            }),
        ).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole("button", { name: "Continuar" })[0])
        expect(
            screen.getByRole("heading", { name: "Tudo pronto para começar!" }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole("button", { name: "Explorar Trilhas" }),
        )

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(
                    ([, options]) => options?.method === "PATCH",
                ),
            ).toBe(true),
        )
        expect(await screen.findByText("Home stub")).toBeInTheDocument()
    })

    it("permite pular o tour e conclui o onboarding no backend", async () => {
        const fetchMock = mockFetch()

        renderOnboarding()

        await screen.findByRole("heading", { name: "Bem-vindo ao VariSkill!" })

        fireEvent.click(screen.getByRole("button", { name: "Pular tour" }))

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(
                    ([, options]) => options?.method === "PATCH",
                ),
            ).toBe(true),
        )
        expect(await screen.findByText("Home stub")).toBeInTheDocument()
    })

    it("não reexibe o onboarding quando is_primeiro_acesso é false", async () => {
        mockFetch({ ...BASE_USER, is_primeiro_acesso: false })

        renderOnboarding()

        expect(await screen.findByText("Home stub")).toBeInTheDocument()
        expect(
            screen.queryByRole("heading", { name: "Bem-vindo ao VariSkill!" }),
        ).not.toBeInTheDocument()
    })
})
