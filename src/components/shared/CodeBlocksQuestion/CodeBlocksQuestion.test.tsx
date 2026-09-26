import { fireEvent, render, screen } from "@testing-library/react"

import { CodeBlocksQuestion } from "./CodeBlocksQuestion"

const MOCK_AVAILABLE_BLOCKS = [
    { id: "b1", label: "const" },
    { id: "b2", label: "updateCount" },
    { id: "b3", label: "console.log" },
]

const MOCK_CODE_TEMPLATE = [
    "__SLOT_0__ SUM_VALUE = 2;",
    "function updateCount(value) {",
    "    let newValue = value;",
    "    return newValue;",
    "}",
    "const result = __SLOT_1__(4);",
    '__SLOT_2__("O resultado é: ", result);',
]

describe("CodeBlocksQuestion Component", () => {
    it("deve renderizar o enunciado, código com slots e blocos disponíveis", () => {
        render(
            <CodeBlocksQuestion
                questionText="Arraste os blocos para completar o código adequadamente:"
                codeTemplate={MOCK_CODE_TEMPLATE}
                availableBlocks={MOCK_AVAILABLE_BLOCKS}
                slotAssignments={{}}
                onChangeSlotAssignments={jest.fn()}
            />,
        )

        expect(
            screen.getByText(
                "Arraste os blocos para completar o código adequadamente:",
            ),
        ).toBeInTheDocument()
        expect(screen.getByText("SUM_VALUE = 2;")).toBeInTheDocument()
        expect(screen.getByText("const")).toBeInTheDocument()
        expect(screen.getByText("updateCount")).toBeInTheDocument()
        expect(screen.getByText("console.log")).toBeInTheDocument()
    })

    it("deve encaixar a pílula clicada no primeiro slot vazio e chamar onChangeSlotAssignments", () => {
        const handleChange = jest.fn()

        render(
            <CodeBlocksQuestion
                questionText="Arraste os blocos"
                codeTemplate={MOCK_CODE_TEMPLATE}
                availableBlocks={MOCK_AVAILABLE_BLOCKS}
                slotAssignments={{}}
                onChangeSlotAssignments={handleChange}
            />,
        )

        const blockButton = screen.getByRole("button", { name: "const" })
        fireEvent.click(blockButton)

        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith({ 0: "b1" })
    })

    it("deve desencaixar o bloco ao clicar no bloco fixado no slot", () => {
        const handleChange = jest.fn()

        render(
            <CodeBlocksQuestion
                questionText="Arraste os blocos"
                codeTemplate={MOCK_CODE_TEMPLATE}
                availableBlocks={MOCK_AVAILABLE_BLOCKS}
                slotAssignments={{ 0: "b1", 1: "b2" }}
                onChangeSlotAssignments={handleChange}
            />,
        )

        const slottedBlock = screen.getByRole("button", { name: "const" })
        fireEvent.click(slottedBlock)

        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith({ 1: "b2" })
    })

    it("não deve permitir alteração quando disabled=true", () => {
        const handleChange = jest.fn()

        render(
            <CodeBlocksQuestion
                questionText="Arraste os blocos"
                codeTemplate={MOCK_CODE_TEMPLATE}
                availableBlocks={MOCK_AVAILABLE_BLOCKS}
                slotAssignments={{}}
                onChangeSlotAssignments={handleChange}
                disabled
            />,
        )

        const blockButton = screen.getByRole("button", { name: "const" })
        fireEvent.click(blockButton)

        expect(handleChange).not.toHaveBeenCalled()
        expect(blockButton).toBeDisabled()
    })
})
