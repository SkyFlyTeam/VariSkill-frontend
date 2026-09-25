import { useState } from "react"
import {
    MultipleChoiceQuestion,
    type MultipleChoiceOption,
} from "@/components/shared/MultipleChoiceQuestion/MultipleChoiceQuestion"
import { Button } from "@/components/ui/button"

const MOCK_QUESTION_TEXT = "3 - Qual será a saída desse código?"

const MOCK_OPTIONS: MultipleChoiceOption[] = [
    { id: "opt-a", label: "4" },
    { id: "opt-b", label: "6 (Correta: 4 + 2)" },
    { id: "opt-c", label: "8" },
    { id: "opt-d", label: "2" },
]

export function MultipleChoicePreviewPage() {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
    const [confirmedOption, setConfirmedOption] = useState<string | null>(null)

    function handleVerify() {
        if (selectedOptionId) {
            setConfirmedOption(selectedOptionId)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 sm:p-8">
            <div className="w-full max-w-2xl space-y-6 rounded-3xl bg-card p-6 shadow-lg sm:p-8">
                <div className="space-y-2 border-b pb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Preview Componente (VAR-47)
                    </span>
                </div>

                {/* Exemplo de Código JS (conforme Figma 86-959) */}
                <div className="rounded-xl bg-[#001a3f] p-4 text-sm font-mono text-sky-200">
                    <p className="text-pink-400">const SUM_VALUE = 2;</p>
                    <p className="text-[#46b6e1]">function updateCount(value) &#123;</p>
                    <p className="pl-4">let newValue = value;</p>
                    <p className="pl-4">newValue += SUM_VALUE;</p>
                    <p className="pl-4">return newValue;</p>
                    <p>&#125;</p>
                    <p className="text-amber-300">const result = updateCount(4);</p>
                    <p className="text-emerald-400">console.log("O resultado é: ", result);</p>
                </div>

                <MultipleChoiceQuestion
                    questionText={MOCK_QUESTION_TEXT}
                    options={MOCK_OPTIONS}
                    selectedOptionId={selectedOptionId}
                    onSelectOption={setSelectedOptionId}
                />

                <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Opção selecionada:{" "}
                        <strong className="text-foreground">
                            {selectedOptionId ? selectedOptionId.toUpperCase() : "Nenhuma"}
                        </strong>
                    </p>

                    <Button
                        variant="vari"
                        size="lg"
                        disabled={!selectedOptionId}
                        onClick={handleVerify}
                        className="w-full sm:w-auto"
                    >
                        Verificar
                    </Button>
                </div>

                {confirmedOption && (
                    <div className="rounded-xl bg-emerald-500/10 p-4 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Resposta "{confirmedOption.toUpperCase()}" confirmada com sucesso!
                    </div>
                )}
            </div>
        </main>
    )
}
