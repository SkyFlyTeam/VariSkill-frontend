import { MemoryRouter, Route, Routes } from "react-router-dom"

import { fireEvent, render, screen } from "@testing-library/react"

import { OnboardingPage } from "./Onboarding"

function renderOnboarding() {
    return render(
        <MemoryRouter initialEntries={["/onboarding"]}>
            <Routes>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/" element={<div>Home stub</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe("OnboardingPage", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("abre a primeira etapa automaticamente com indicador 1 de 4", () => {
        renderOnboarding()

        expect(
            screen.getByRole("heading", { name: "Bem-vindo ao VariSkill!" }),
        ).toBeInTheDocument()
        expect(screen.getAllByRole("tab")).toHaveLength(4)
        expect(
            screen.getByRole("tab", { name: "Etapa 1 de 4" }),
        ).toHaveAttribute("aria-selected", "true")
    })

    it("avança sequencialmente pelas 4 etapas e redireciona ao final", () => {
        renderOnboarding()

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

        expect(screen.getByText("Home stub")).toBeInTheDocument()
        expect(localStorage.getItem("variskill:onboarding-completed")).toBe(
            "true",
        )
    })

    it("permite pular o tour a qualquer momento e persiste a conclusão", () => {
        renderOnboarding()

        fireEvent.click(screen.getByRole("button", { name: "Pular tour" }))

        expect(screen.getByText("Home stub")).toBeInTheDocument()
        expect(localStorage.getItem("variskill:onboarding-completed")).toBe(
            "true",
        )
    })

    it("não reexibe o onboarding se já estiver concluído", () => {
        localStorage.setItem("variskill:onboarding-completed", "true")

        renderOnboarding()

        expect(screen.getByText("Home stub")).toBeInTheDocument()
        expect(
            screen.queryByRole("heading", { name: "Bem-vindo ao VariSkill!" }),
        ).not.toBeInTheDocument()
    })
})
