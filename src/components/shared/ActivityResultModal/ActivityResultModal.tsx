import { Check, FlaskConical, ListChecks, Trophy, X } from "lucide-react"

import celebrationVari from "@/assets/vari/celebrationVari.svg"
import retryVari from "@/assets/vari/retryVari.svg"
import { VariMessageModal } from "@/components/shared/VariMessageModal/VariMessageModal"
import { cn } from "@/lib/utils"

export const APPROVAL_THRESHOLD_PERCENT = 70

export interface QuestionFeedback {
    questao_id: string
    correta: boolean
    explicacao: string
}

/** Response de `POST /api/atividades/{id}/submeter/` (VAR-41), com os nomes literais da API. */
export interface ActivitySubmissionResult {
    execucao_id: string
    aprovado: boolean
    taxa_acerto: number
    pontuacao_obtida: number
    xp_concedido: number
    novo_xp_total: number
    executado_em: string
    questoes_feedback: QuestionFeedback[]
}

export interface ActivityResultModalProps {
    open: boolean
    result: ActivitySubmissionResult
    /** Aprovado: chamado ao clicar em "Continuar" (voltar ao roadmap da trilha). */
    onContinue: () => void
    /** Reprovado: chamado ao clicar em "Tentar Novamente". */
    onRetry: () => void
}

const numberFormat = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
})

function formatExecutedAt(isoDate: string) {
    return new Date(isoDate).toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
    })
}

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    iconClassName,
}: {
    label: string
    value: string
    hint?: string
    icon: typeof Trophy
    iconClassName: string
}) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 p-3 text-center">
            <Icon aria-hidden="true" className={cn("size-5", iconClassName)} />
            <span className="text-[11px] font-medium text-muted-foreground">
                {label}
            </span>
            <span className="text-lg font-bold">{value}</span>
            {hint && (
                <span className="text-[11px] text-muted-foreground">
                    {hint}
                </span>
            )}
        </div>
    )
}

export function ActivityResultModal({
    open,
    result,
    onContinue,
    onRetry,
}: ActivityResultModalProps) {
    const approved = result.aprovado
    const hitRate = numberFormat.format(result.taxa_acerto)

    return (
        <VariMessageModal
            open={open}
            /** Só os botões encerram o modal: Esc e clique fora são ignorados. */
            onOpenChange={() => {}}
            illustration={
                approved
                    ? {
                          src: celebrationVari,
                          alt: "Vari comemorando com confete",
                      }
                    : {
                          src: retryVari,
                          alt: "Vari preocupado, pronto para tentar de novo",
                      }
            }
            title={
                approved
                    ? "Parabéns, você foi aprovado!"
                    : "Quase lá! Vamos tentar de novo"
            }
            message={
                approved
                    ? `Você acertou ${hitRate}% das questões. Seu próximo passo na trilha já está liberado.`
                    : `Você acertou ${hitRate}% das questões e a nota de corte é ${APPROVAL_THRESHOLD_PERCENT}%. Veja abaixo o que revisar e tente novamente.`
            }
            actionLabel={approved ? "Continuar" : "Tentar Novamente"}
            onAction={approved ? onContinue : onRetry}
        >
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <StatCard
                        label="Taxa de acerto"
                        value={`${hitRate}%`}
                        icon={ListChecks}
                        iconClassName="text-emerald-600"
                    />
                    <StatCard
                        label="Pontuação obtida"
                        value={`${numberFormat.format(result.pontuacao_obtida)} pts`}
                        icon={Trophy}
                        iconClassName="text-amber-500"
                    />
                    <StatCard
                        label="XP concedido"
                        value={`${approved ? "+" : ""}${numberFormat.format(result.xp_concedido)} XP`}
                        hint={`Total: ${numberFormat.format(result.novo_xp_total)} XP`}
                        icon={FlaskConical}
                        iconClassName="text-violet-700"
                    />
                </div>

                <p className="text-center text-[11px] text-muted-foreground sm:text-xs">
                    Realizado em {formatExecutedAt(result.executado_em)}
                </p>

                <section aria-label="Parecer por questão" className="space-y-2">
                    <h3 className="text-sm font-bold">Parecer por questão</h3>

                    <ul className="flex flex-col gap-2">
                        {result.questoes_feedback.map((feedback, index) => (
                            <li
                                key={feedback.questao_id}
                                className={cn(
                                    "flex gap-2.5 rounded-xl p-3 text-left text-xs sm:text-sm",
                                    feedback.correta
                                        ? "bg-emerald-50"
                                        : "bg-red-50",
                                )}
                            >
                                {feedback.correta ? (
                                    <Check
                                        aria-hidden="true"
                                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                                    />
                                ) : (
                                    <X
                                        aria-hidden="true"
                                        className="mt-0.5 size-4 shrink-0 text-vari"
                                    />
                                )}

                                <div className="space-y-0.5">
                                    <p className="font-bold">
                                        Questão {index + 1} —{" "}
                                        {feedback.correta
                                            ? "Correta"
                                            : "Incorreta"}
                                    </p>

                                    {feedback.explicacao && (
                                        <p className="text-muted-foreground">
                                            {feedback.explicacao}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </VariMessageModal>
    )
}
