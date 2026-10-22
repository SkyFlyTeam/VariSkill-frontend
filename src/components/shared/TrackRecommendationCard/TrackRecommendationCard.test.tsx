import { render, screen, fireEvent } from "@testing-library/react"
import { TrackRecommendationCard } from "./TrackRecommendationCard"

describe("TrackRecommendationCard", () => {
    const mockProps = {
        id: "trilha-python",
        title: "Python para Iniciantes",
        skill: "Backend",
        reason: "Perfeita para começar seus estudos em lógica e programação back-end.",
        onStartTrack: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("deve renderizar os dados da recomendação corretamente", () => {
        render(<TrackRecommendationCard {...mockProps} />)

        expect(screen.getByText("Python para Iniciantes")).toBeInTheDocument()
        expect(screen.getByText("Backend")).toBeInTheDocument()
        expect(
            screen.getByText(
                "Perfeita para começar seus estudos em lógica e programação back-end.",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Iniciar Trilha/i }),
        ).toBeInTheDocument()
    })

    it("deve chamar onStartTrack com o id correto ao clicar no botão", () => {
        render(<TrackRecommendationCard {...mockProps} />)

        const button = screen.getByRole("button", { name: /Iniciar Trilha/i })
        fireEvent.click(button)

        expect(mockProps.onStartTrack).toHaveBeenCalledTimes(1)
        expect(mockProps.onStartTrack).toHaveBeenCalledWith("trilha-python")
    })

    it("deve desabilitar o botão e exibir feedback quando loading for true", () => {
        render(<TrackRecommendationCard {...mockProps} loading={true} />)

        const button = screen.getByRole("button", { name: /Iniciando.../i })
        expect(button).toBeDisabled()
        expect(screen.getByText("Iniciando...")).toBeInTheDocument()
    })
})

