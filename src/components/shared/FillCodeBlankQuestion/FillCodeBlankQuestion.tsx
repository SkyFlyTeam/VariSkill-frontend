import React, { useEffect, useMemo } from "react"

import { cn } from "cn"

import { CodeFrame } from "@/components/shared/CodeFrame/CodeFrame"
import { Button } from "@/components/ui/button"

export interface FillCodeBlankQuestionProps {
    /** Enunciado da questão */
    questionText: string
    /** Template das linhas de código. As lacunas no código são marcadas como `__BLANK_0__`, `__BLANK_1__`, etc. */
    codeTemplate: string[]
    /** Mapeamento de blankIndex -> texto digitado pelo aluno */
    blankValues: Record<number, string>
    /** Callback acionado ao alterar o valor digitado de qualquer lacuna */
    onChangeBlankValues: (values: Record<number, string>) => void
    /** Callback acionado quando o usuário clica no botão de envio/verificação */
    onSubmit?: () => void
    /** Callback que notifica quando o estado de validação de preenchimento muda */
    onValidationChange?: (isValid: boolean) => void
    /** Texto personalizado do botão de envio */
    submitButtonText?: string
    /** Se a interatividade está desabilitada */
    disabled?: boolean
    /** Se o botão de envio deve ser ocultado (ex: caso controlado por container pai) */
    hideSubmitButton?: boolean
    /** Nome do arquivo no editor */
    fileName?: string
    /** Linguagem de programação */
    language?: string
    /** Classe CSS adicional */
    className?: string
}

export const FillCodeBlankQuestion: React.FC<FillCodeBlankQuestionProps> = ({
    questionText,
    codeTemplate,
    blankValues,
    onChangeBlankValues,
    onSubmit,
    onValidationChange,
    submitButtonText = "Verificar Resposta",
    disabled = false,
    hideSubmitButton = false,
    fileName = "exercise.js",
    language = "JavaScript",
    className,
}) => {
    // Extrai todos os índices de lacunas esperados do template
    const requiredBlankIndices = useMemo(() => {
        const indices = new Set<number>()
        codeTemplate.forEach((line) => {
            const matches = line.matchAll(/__BLANK_(\d+)__/g)
            for (const match of matches) {
                indices.add(parseInt(match[1], 10))
            }
        })
        return Array.from(indices).sort((a, b) => a - b)
    }, [codeTemplate])

    // Verifica se todas as lacunas estão preenchidas (não vazias e não contendo apenas espaços)
    const isAllBlanksFilled = useMemo(() => {
        if (requiredBlankIndices.length === 0) return true
        return requiredBlankIndices.every((index) => {
            const val = blankValues[index]
            return val !== undefined && val.trim().length > 0
        })
    }, [requiredBlankIndices, blankValues])

    const emptyBlanksCount = useMemo(() => {
        return requiredBlankIndices.filter((index) => {
            const val = blankValues[index]
            return val === undefined || val.trim().length === 0
        }).length
    }, [requiredBlankIndices, blankValues])

    useEffect(() => {
        onValidationChange?.(isAllBlanksFilled)
    }, [isAllBlanksFilled, onValidationChange])

    function handleInputChange(blankIndex: number, text: string) {
        if (disabled) return
        onChangeBlankValues({
            ...blankValues,
            [blankIndex]: text,
        })
    }

    function renderCodeLine(line: string) {
        const parts = line.split(/(__BLANK_\d+__)/g)

        return parts.map((part, pIdx) => {
            const blankMatch = part.match(/__BLANK_(\d+)__/)
            if (!blankMatch) {
                return <span key={pIdx}>{part}</span>
            }

            const blankIndex = parseInt(blankMatch[1], 10)
            const currentValue = blankValues[blankIndex] || ""

            return (
                <input
                    key={pIdx}
                    type="text"
                    value={currentValue}
                    disabled={disabled}
                    onChange={(e) =>
                        handleInputChange(blankIndex, e.target.value)
                    }
                    placeholder=""
                    size={Math.max(currentValue.length + 1, 4)}
                    className={cn(
                        "mx-1 inline-block h-7 border-b-2 border-dashed border-[#46b6e1] bg-transparent px-1 font-mono text-sm leading-7 font-bold text-[#46b6e1] outline-none transition-colors sm:text-base",
                        "focus:border-solid focus:border-[#46b6e1] focus:bg-[#46b6e1]/10 rounded-xs",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                />
            )
        })
    }

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-6 rounded-[15px] bg-[#f9fafb] p-6 text-foreground shadow-sm dark:bg-card dark:text-foreground",
                className,
            )}
        >
            <h2 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {questionText}
            </h2>

            {/* Quadro de Código usando a mesma estrutura CodeFrame */}
            <CodeFrame
                lines={codeTemplate}
                renderLine={renderCodeLine}
                fileName={fileName}
                language={language}
            />

            {!hideSubmitButton && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        {emptyBlanksCount > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                                Preencha todas as lacunas para enviar (
                                {emptyBlanksCount}{" "}
                                {emptyBlanksCount === 1
                                    ? "restante"
                                    : "restantes"}
                                )
                            </span>
                        ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                Todas as lacunas preenchidas!
                            </span>
                        )}
                    </p>

                    <Button
                        variant="vari"
                        size="lg"
                        disabled={disabled || !isAllBlanksFilled}
                        onClick={onSubmit}
                        className="w-full sm:w-auto"
                    >
                        {submitButtonText}
                    </Button>
                </div>
            )}
        </div>
    )
}
