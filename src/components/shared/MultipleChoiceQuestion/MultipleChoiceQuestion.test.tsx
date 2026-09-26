import { fireEvent, render, screen } from "@testing-library/react"

import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion"

const MOCK_OPTIONS = [
    { id: "opt-1", label: "Alternativa 45" },
    { id: "opt-2", label: "Alternativa 56" },
    { id: "opt-3", label: "Alternativa 23" },
    { id: "opt-4", label: "Alternativa 12" },
]

describe("MultipleChoiceQuestion Component", () => {
    it("deve renderizar o enunciado e todas as alternativas", () => {
        render(
            <MultipleChoiceQuestion
                questionText="Qual será a saída desse código?"
                options={MOCK_OPTIONS}
            />,
        )

        expect(
            screen.getByText("Qual será a saída desse código?"),
        ).toBeInTheDocument()

        expect(screen.getByText("Alternativa 45")).toBeInTheDocument()
        expect(screen.getByText("Alternativa 56")).toBeInTheDocument()
        expect(screen.getByText("Alternativa 23")).toBeInTheDocument()
        expect(screen.getByText("Alternativa 12")).toBeInTheDocument()
    })

    it("deve disparar onSelectOption com o ID correto ao clicar em uma opção", () => {
        const handleSelectOption = jest.fn()

        render(
            <MultipleChoiceQuestion
                questionText="Qual será a saída desse código?"
                options={MOCK_OPTIONS}
                onSelectOption={handleSelectOption}
            />,
        )

        const optionB = screen.getByRole("radio", { name: /B Alternativa 56/i })
        fireEvent.click(optionB)

        expect(handleSelectOption).toHaveBeenCalledTimes(1)
        expect(handleSelectOption).toHaveBeenCalledWith("opt-2")
    })

    it("deve marcar com aria-checked=true apenas a opcao selecionada", () => {
        render(
            <MultipleChoiceQuestion
                questionText="Qual será a saída desse código?"
                options={MOCK_OPTIONS}
                selectedOptionId="opt-3"
            />,
        )

        const optionA = screen.getByRole("radio", { name: /A Alternativa 45/i })
        const optionC = screen.getByRole("radio", { name: /C Alternativa 23/i })

        expect(optionA).toHaveAttribute("aria-checked", "false")
        expect(optionC).toHaveAttribute("aria-checked", "true")
    })

    it("nao deve disparar evento se estiver desabilitado", () => {
        const handleSelectOption = jest.fn()

        render(
            <MultipleChoiceQuestion
                questionText="Qual será a saída desse código?"
                options={MOCK_OPTIONS}
                onSelectOption={handleSelectOption}
                disabled
            />,
        )

        const optionA = screen.getByRole("radio", { name: /A Alternativa 45/i })
        fireEvent.click(optionA)

        expect(handleSelectOption).not.toHaveBeenCalled()
        expect(optionA).toBeDisabled()
    })
})
