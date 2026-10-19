import type { QuestionProps } from "@/components/shared/Question/Question"

export type QuestaoOpcao = {
    id: string
    texto_opcao: string
    ordem: number
}

export type Questao = {
    id: string
    tipo_exercicio: string
    enunciado: string
    codigo_snippet: string
    opcoes: QuestaoOpcao[]
}

export type QuestionAnswer = {
    selectedOptionId: string | null
    slotAssignments: Record<number, string>
    blankValues: Record<number, string>
}

export const EMPTY_ANSWER: QuestionAnswer = {
    selectedOptionId: null,
    slotAssignments: {},
    blankValues: {},
}

function sortedValues(record: Record<number, string>): string[] {
    return Object.keys(record)
        .map(Number)
        .sort((a, b) => a - b)
        .map((key) => record[key])
}

function countSlots(codigoSnippet: string): number {
    return codigoSnippet
        .split("\n")
        .reduce(
            (total, line) => total + (line.match(/__SLOT_\d+__/g)?.length ?? 0),
            0,
        )
}

function shuffleDeterministic<T>(items: T[], seedSource: string): T[] {
    let seed = 0
    for (let i = 0; i < seedSource.length; i++) {
        seed = (seed * 31 + seedSource.charCodeAt(i)) & 0xffffffff
    }
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff
        const j = Math.abs(seed) % (i + 1)
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
    }
    return shuffled
}

export function buildQuestionProps(
    questao: Questao,
    answer: QuestionAnswer,
    onChange: (answer: QuestionAnswer) => void,
): QuestionProps | null {
    const blocks = questao.opcoes
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((opcao) => ({ id: opcao.id, label: opcao.texto_opcao }))
    const codeTemplate = questao.codigo_snippet
        ? questao.codigo_snippet.split("\n")
        : []

    switch (questao.tipo_exercicio) {
        case "MULTIPLA_ESCOLHA":
            return {
                tipo: "MULTIPLA_ESCOLHA",
                question: {
                    questionText: "",
                    options: shuffleDeterministic(blocks, questao.id),
                    selectedOptionId: answer.selectedOptionId,
                    onSelectOption: (selectedOptionId) =>
                        onChange({ ...answer, selectedOptionId }),
                },
            }
        case "ORDENAR_BLOCOS":
            return {
                tipo: "ORDENAR_BLOCOS",
                question: {
                    questionText: "",
                    codeTemplate,
                    availableBlocks: blocks,
                    slotAssignments: answer.slotAssignments,
                    onChangeSlotAssignments: (slotAssignments) =>
                        onChange({ ...answer, slotAssignments }),
                },
            }
        case "COMPLETE_CODIGO":
            return {
                tipo: "COMPLETE_CODIGO",
                question: {
                    questionText: "",
                    codeTemplate,
                    blankValues: answer.blankValues,
                    onChangeBlankValues: (blankValues) =>
                        onChange({ ...answer, blankValues }),
                    hideSubmitButton: true,
                },
            }
        default:
            return null
    }
}

export function isAnswerComplete(
    questao: Questao,
    answer: QuestionAnswer,
): boolean {
    switch (questao.tipo_exercicio) {
        case "MULTIPLA_ESCOLHA":
            return answer.selectedOptionId !== null
        case "ORDENAR_BLOCOS": {
            const slotCount = countSlots(questao.codigo_snippet)
            return (
                slotCount > 0 &&
                Object.keys(answer.slotAssignments).length === slotCount
            )
        }
        case "COMPLETE_CODIGO":
            return Object.values(answer.blankValues).some(
                (value) => value.trim() !== "",
            )
        default:
            return false
    }
}

export function serializeAnswer(
    questao: Questao,
    answer: QuestionAnswer,
): string[] {
    switch (questao.tipo_exercicio) {
        case "MULTIPLA_ESCOLHA":
            return answer.selectedOptionId ? [answer.selectedOptionId] : []
        case "ORDENAR_BLOCOS":
            return sortedValues(answer.slotAssignments)
        case "COMPLETE_CODIGO":
            return sortedValues(answer.blankValues)
        default:
            return []
    }
}
