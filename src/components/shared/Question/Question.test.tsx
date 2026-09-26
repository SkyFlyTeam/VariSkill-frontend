import { render, screen } from "@testing-library/react"

import { Question } from "./Question"

describe("Question Component", () => {
    it("deve renderizar a questão de múltipla escolha quando tipo for MULTIPLA_ESCOLHA", () => {
        render(
            <Question
                tipo="MULTIPLA_ESCOLHA"
                question={{
                    questionText: "Qual será a saída desse código?",
                    options: [
                        { id: "opt-1", label: "4" },
                        { id: "opt-2", label: "6" },
                    ],
                }}
            />,
        )

        expect(
            screen.getByText("Qual será a saída desse código?"),
        ).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: "A 4" })).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: "B 6" })).toBeInTheDocument()
    })

    it("deve renderizar a questão de code blocks quando tipo for ORDENAR_BLOCOS", () => {
        render(
            <Question
                tipo="ORDENAR_BLOCOS"
                question={{
                    questionText: "Encaixe o bloco no espaço vazio",
                    codeTemplate: ["const soma = __SLOT_0__"],
                    availableBlocks: [{ id: "bloco-1", label: "a + b" }],
                    slotAssignments: {},
                    onChangeSlotAssignments: jest.fn(),
                }}
            />,
        )

        expect(
            screen.getByText("Encaixe o bloco no espaço vazio"),
        ).toBeInTheDocument()
        expect(screen.getByText("a + b")).toBeInTheDocument()
    })

    it("deve renderizar a questão de escrita de texto quando tipo for COMPLETE_CODIGO", () => {
        render(
            <Question
                tipo="COMPLETE_CODIGO"
                question={{
                    questionText: "Escreva as partes faltantes",
                    codeTemplate: ["const soma = __BLANK_0__"],
                    blankValues: {},
                    onChangeBlankValues: jest.fn(),
                }}
            />,
        )

        expect(
            screen.getByText("Escreva as partes faltantes"),
        ).toBeInTheDocument()
        expect(screen.getByRole("textbox")).toBeInTheDocument()
    })
})
