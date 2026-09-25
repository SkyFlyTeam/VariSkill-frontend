import React from "react"
import { cn } from "cn"

export interface MultipleChoiceOption {
    id: string
    label: string
}

export interface MultipleChoiceQuestionProps {
    /** Enunciado da questão */
    questionText: string
    /** Lista de alternativas da questão */
    options: MultipleChoiceOption[]
    /** ID da opção atualmente selecionada pelo usuário */
    selectedOptionId?: string | null
    /** Callback chamado quando o usuário escolhe uma opção */
    onSelectOption?: (optionId: string) => void
    /** Se a interatividade está desabilitada */
    disabled?: boolean
    /** Classe CSS adicional */
    className?: string
}

const OPTION_PREFIXES = ["A", "B", "C", "D", "E", "F"]

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
    questionText,
    options,
    selectedOptionId,
    onSelectOption,
    disabled = false,
    className,
}) => {
    return (
        <div className={cn("flex w-full flex-col gap-6", className)}>
            {/* Enunciado do Exercício */}
            <h2 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {questionText}
            </h2>

            {/* Alternativas */}
            <div
                className="flex flex-col gap-3"
                role="radiogroup"
                aria-label={questionText}
            >
                {options.map((option, index) => {
                    const isSelected = selectedOptionId === option.id
                    const prefix = OPTION_PREFIXES[index] || `${index + 1}`

                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={disabled}
                            onClick={() => onSelectOption?.(option.id)}
                            className={cn(
                                "group relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-medium transition-all outline-none",
                                "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                                isSelected
                                    ? "border-[#46b6e1] bg-[#46b6e1]/10 text-foreground shadow-sm"
                                    : "border-border bg-card hover:border-[#46b6e1]/50 hover:bg-muted/50 text-foreground"
                            )}
                        >
                            {/* Prefix Badge (A, B, C, D) */}
                            <span
                                className={cn(
                                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors",
                                    isSelected
                                        ? "bg-[#46b6e1] text-white"
                                        : "bg-muted text-muted-foreground group-hover:bg-[#46b6e1]/20 group-hover:text-foreground"
                                )}
                            >
                                {prefix}
                            </span>

                            {/* Texto da Alternativa */}
                            <span className="flex-1 text-base leading-relaxed sm:text-lg">
                                {option.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
