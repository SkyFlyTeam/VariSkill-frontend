import { fireEvent, render, screen } from "@testing-library/react"

import { FillCodeBlankQuestion } from "./FillCodeBlankQuestion"

const MOCK_CODE_TEMPLATE = [
    "__BLANK_0__ SUM_VALUE = 2",
    "function updateCount(value) {",
    "    let newValue = value;",
    "    return newValue",
    "}",
    "result = __BLANK_1__(4)",
]

describe("FillCodeBlankQuestion Component", () => {
    it("deve renderizar o enunciado, código e os inputs de lacuna", () => {
        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes do código abaixo:"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{}}
                onChangeBlankValues={jest.fn()}
            />,
        )

        expect(
            screen.getByText("Escreva as partes faltantes do código abaixo:"),
        ).toBeInTheDocument()
        expect(screen.getByText("SUM_VALUE = 2")).toBeInTheDocument()

        const inputs = screen.getAllByRole("textbox")
        expect(inputs).toHaveLength(2)
    })

    it("deve disparar onChangeBlankValues ao digitar em um input de lacuna", () => {
        const handleChange = jest.fn()

        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{}}
                onChangeBlankValues={handleChange}
            />,
        )

        const inputs = screen.getAllByRole("textbox")
        fireEvent.change(inputs[0], { target: { value: "const" } })

        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith({ 0: "const" })
    })

    it("não deve permitir digitação quando disabled=true", () => {
        const handleChange = jest.fn()

        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{}}
                onChangeBlankValues={handleChange}
                disabled
            />,
        )

        const inputs = screen.getAllByRole("textbox")
        expect(inputs[0]).toBeDisabled()
    })

    it("deve bloquear o botão de envio quando houver lacunas vazias e notificar onValidationChange(false)", () => {
        const handleSubmit = jest.fn()
        const handleValidationChange = jest.fn()

        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{ 0: "const" }} // falta a lacuna 1
                onChangeBlankValues={jest.fn()}
                onSubmit={handleSubmit}
                onValidationChange={handleValidationChange}
            />,
        )

        const submitButton = screen.getByRole("button", {
            name: /verificar resposta/i,
        })
        expect(submitButton).toBeDisabled()
        expect(
            screen.getByText(/preencha todas as lacunas para enviar/i),
        ).toBeInTheDocument()
        expect(handleValidationChange).toHaveBeenCalledWith(false)

        fireEvent.click(submitButton)
        expect(handleSubmit).not.toHaveBeenCalled()
    })

    it("deve habilitar o botão de envio quando todas as lacunas forem preenchidas e chamar onSubmit", () => {
        const handleSubmit = jest.fn()
        const handleValidationChange = jest.fn()

        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{ 0: "const", 1: "updateCount" }}
                onChangeBlankValues={jest.fn()}
                onSubmit={handleSubmit}
                onValidationChange={handleValidationChange}
            />,
        )

        const submitButton = screen.getByRole("button", {
            name: /verificar resposta/i,
        })
        expect(submitButton).toBeEnabled()
        expect(
            screen.getByText(/todas as lacunas preenchidas!/i),
        ).toBeInTheDocument()
        expect(handleValidationChange).toHaveBeenCalledWith(true)

        fireEvent.click(submitButton)
        expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it("deve aplicar classes de fonte monoespaçada alinhada ao CodeFrame nos inputs de lacuna", () => {
        render(
            <FillCodeBlankQuestion
                questionText="Escreva as partes faltantes"
                codeTemplate={MOCK_CODE_TEMPLATE}
                blankValues={{}}
                onChangeBlankValues={jest.fn()}
            />,
        )

        const inputs = screen.getAllByRole("textbox")
        inputs.forEach((input) => {
            expect(input).toHaveClass("font-mono")
            expect(input).toHaveClass("text-sm")
            expect(input).toHaveClass("sm:text-base")
            expect(input).toHaveClass("leading-7")
        })
    })
})
