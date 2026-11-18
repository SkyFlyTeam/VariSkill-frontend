import { useRef, useState } from "react"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { FlaskConical } from "lucide-react"

import celebrationVari from "@/assets/vari/celebrationVari.svg"
import { Button } from "@/components/ui/button"
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { PixelGift, PixelMedal, PixelSparkle } from "./PixelArt"

/**
 * Item de `conquistas_desbloqueadas` no retorno de `POST /atividades/{id}/submeter/`.
 * Os nomes seguem os models `Conquista` e `ItemCosmetico` do backend (VAR-106);
 * o motor (VAR-108) e a serialização (VAR-109) ainda vão preencher o campo.
 */
export interface AchievementReward {
    id: string
    nome: string
    /** `AVATAR` | `TITULO` | `BORDA`. */
    tipo: string
    /** `COMUM` | `RARO` | `EPICO` | `LENDARIO`; outros valores são exibidos como vierem. */
    raridade: string
    /** URL da arte do item. Vazia/nula = presente pixelado. */
    asset_url?: string | null
}

export interface UnlockedAchievement {
    id: string
    codigo: string
    titulo: string
    descricao: string
    /** `PROGRESSO` | `STREAK` | `PRECISAO`: define a medalha exibida. */
    categoria: string
    /** Arquivo do ícone no backend; ainda não usado pelo front. */
    icone?: string
    xp_recompensa: number
    /** Itens cosméticos que têm esta conquista como requisito. */
    recompensas?: AchievementReward[]
}

export interface AchievementUnlockedModalProps {
    /** Controla se o modal está aberto. */
    open: boolean
    /** Conquistas desbloqueadas na submissão, exibidas uma por vez. */
    achievements: UnlockedAchievement[]
    /** Chamado ao concluir a última conquista (botão "Continuar" ou Esc). */
    onClose: () => void
    /** Link para a aba de conquistas (VAR-111). Omitido = link oculto. */
    onViewAchievements?: () => void
}

const RARITY: Record<string, { label: string; className: string }> = {
    COMUM: { label: "Comum", className: "bg-gray-100 text-gray-600" },
    RARO: { label: "Raro", className: "bg-sky-100 text-main-blue-dark" },
    EPICO: { label: "Épico", className: "bg-violet-100 text-violet-800" },
    LENDARIO: { label: "Lendário", className: "bg-amber-100 text-amber-900" },
}

/** Rótulos de `ItemCosmetico.TIPO_CHOICES`. */
const REWARD_TYPE: Record<string, string> = {
    AVATAR: "Avatar",
    TITULO: "Título de Honra",
    BORDA: "Borda de Perfil",
}

function rarityOf(raridade: string) {
    return (
        RARITY[raridade.toUpperCase()] ?? {
            label: raridade,
            className: "bg-gray-100 text-gray-600",
        }
    )
}

const SPARKLES = [
    { color: "#FFC83D", className: "left-[19%] top-[14%] size-5", delay: "0s" },
    { color: "#46B6E1", className: "left-[77%] top-[10%] size-4", delay: "0.5s" },
    { color: "#FFC83D", className: "left-[84%] top-[57%] size-6", delay: "1s" },
    { color: "#46B6E1", className: "left-[34%] top-[2%] size-3", delay: "1.3s" },
]

function RewardCard({ reward }: { reward: AchievementReward }) {
    const rarity = rarityOf(reward.raridade)
    const typeLabel = REWARD_TYPE[reward.tipo.toUpperCase()] ?? "Cosmético"

    return (
        <li
            data-testid="achievement-reward"
            className="flex w-full animate-achievement-rise items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 p-3 text-left motion-reduce:animate-none sm:gap-3.5 sm:px-4 sm:py-3.5"
        >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-sky-100 sm:size-13">
                {reward.asset_url ? (
                    <img
                        src={reward.asset_url}
                        alt=""
                        className="size-8 object-contain [image-rendering:pixelated] sm:size-9"
                    />
                ) : (
                    <PixelGift className="size-7 sm:size-8" />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-wider text-gray-600 sm:text-[11px]">
                    VOCÊ GANHOU
                </span>
                <span className="truncate text-sm font-bold sm:text-[15px]">
                    {reward.nome}
                </span>
                <span className="hidden text-xs font-medium text-gray-600 sm:block">
                    {typeLabel} · já está no seu inventário
                </span>
            </div>

            <span
                className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    rarity.className,
                )}
            >
                {rarity.label}
            </span>
        </li>
    )
}

export function AchievementUnlockedModal({
    open,
    achievements,
    onClose,
    onViewAchievements,
}: AchievementUnlockedModalProps) {
    const actionButtonRef = useRef<HTMLButtonElement>(null)
    const [index, setIndex] = useState(0)

    const total = achievements.length
    const current = Math.min(index, total - 1)
    const achievement = achievements[current]
    const isLast = current >= total - 1
    const rewards = achievement?.recompensas ?? []

    function handleAdvance() {
        if (isLast) {
            onClose()
            return
        }
        setIndex(current + 1)
        actionButtonRef.current?.focus({ preventScroll: true })
    }

    if (!achievement) return null

    return (
        <DialogPrimitive.Root
            open={open}
            /** Clique fora é ignorado: só o botão de ação ou Esc avançam. */
            disablePointerDismissal
            onOpenChange={(nextOpen) => {
                if (!nextOpen) handleAdvance()
            }}
        >
            <DialogPortal>
                <DialogOverlay className="bg-[rgba(30,41,57,0.6)]" />

                <DialogPrimitive.Popup
                    data-slot="achievement-unlocked-modal"
                    initialFocus={() => {
                        actionButtonRef.current?.focus({ preventScroll: true })
                        return false
                    }}
                    className={cn(
                        "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-140 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] flex-col items-center gap-4.5 overflow-x-hidden overflow-y-auto rounded-2xl bg-white p-6 text-center text-black shadow-lg outline-none sm:gap-5.5 sm:rounded-[15px] sm:px-10 sm:py-8",
                        "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                    )}
                >
                    {total > 1 && (
                        <span className="absolute top-5 right-5 text-xs font-bold text-gray-600">
                            {current + 1} de {total}
                        </span>
                    )}

                    <span className="inline-flex items-center gap-2 rounded-full bg-main-blue-dark px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-white sm:px-3.5 sm:text-[11px]">
                        <PixelSparkle color="#FFC83D" className="static size-2" />
                        CONQUISTA DESBLOQUEADA
                        <PixelSparkle color="#FFC83D" className="static size-2" />
                    </span>

                    {/* `key` reinicia as animações a cada conquista exibida. */}
                    <div
                        key={achievement.id}
                        className="flex w-full flex-col items-center gap-4.5 sm:gap-5.5"
                    >
                        <div className="relative flex h-42.5 w-65 items-center justify-center sm:h-52.5 sm:w-80">
                            <div
                                aria-hidden="true"
                                data-testid="achievement-rays"
                                className="absolute size-42.5 animate-achievement-rays rounded-full motion-reduce:animate-none sm:size-52.5"
                                style={{
                                    background:
                                        "repeating-conic-gradient(rgba(255,200,61,0.38) 0deg 9deg, rgba(255,200,61,0) 9deg 30deg)",
                                    maskImage:
                                        "radial-gradient(circle, #000 35%, transparent 70%)",
                                    WebkitMaskImage:
                                        "radial-gradient(circle, #000 35%, transparent 70%)",
                                }}
                            />
                            <div
                                aria-hidden="true"
                                className="absolute size-28 rounded-full bg-[radial-gradient(circle,rgba(255,200,61,0.45),rgba(255,200,61,0)_70%)] sm:size-35"
                            />

                            {SPARKLES.map((sparkle) => (
                                <PixelSparkle
                                    key={sparkle.className}
                                    color={sparkle.color}
                                    className={cn(
                                        "animate-achievement-twinkle motion-reduce:animate-none",
                                        sparkle.className,
                                    )}
                                    style={{ animationDelay: sparkle.delay }}
                                />
                            ))}

                            <PixelMedal
                                categoria={achievement.categoria}
                                label={`Medalha da conquista ${achievement.titulo}`}
                                className="relative h-27.5 w-26 animate-achievement-pop motion-reduce:animate-none sm:h-34 sm:w-32"
                            />

                            <img
                                src={celebrationVari}
                                alt=""
                                aria-hidden="true"
                                className="absolute -bottom-1.5 -left-1.5 w-18 sm:-bottom-2 sm:-left-3.5 sm:w-24"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:gap-2">
                            <DialogPrimitive.Title className="text-[22px] font-extrabold text-main-blue-dark sm:text-[26px]">
                                {achievement.titulo}
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Description className="text-[13px] leading-normal font-medium text-gray-600 sm:text-sm">
                                {achievement.descricao}
                            </DialogPrimitive.Description>
                            {achievement.xp_recompensa > 0 && (
                                <span className="inline-flex items-center gap-1.5 self-center rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                                    <FlaskConical
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                    +{achievement.xp_recompensa} XP
                                </span>
                            )}
                        </div>

                        {rewards.length > 0 && (
                            <ul
                                aria-label="Recompensas"
                                className="flex w-full flex-col gap-2"
                            >
                                {rewards.map((reward) => (
                                    <RewardCard key={reward.id} reward={reward} />
                                ))}
                            </ul>
                        )}
                    </div>

                    {total > 1 && (
                        <div
                            aria-hidden="true"
                            className="flex gap-2"
                            data-testid="achievement-steps"
                        >
                            {achievements.map((item, itemIndex) => (
                                <span
                                    key={item.id}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        itemIndex === current
                                            ? "w-5.5 bg-vari"
                                            : "w-2 bg-gray-200",
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-5">
                        <Button
                            ref={actionButtonRef}
                            variant="vari"
                            className="h-auto min-h-11 w-full rounded-[10px] px-10 py-3.5 text-xs font-bold sm:w-auto"
                            onClick={handleAdvance}
                        >
                            {isLast ? "Continuar" : "Próxima conquista"}
                        </Button>

                        {onViewAchievements && (
                            <button
                                type="button"
                                className="py-2 text-xs font-bold text-gray-600 underline-offset-2 hover:text-main-blue-dark hover:underline"
                                onClick={onViewAchievements}
                            >
                                Ver minhas conquistas
                            </button>
                        )}
                    </div>
                </DialogPrimitive.Popup>
            </DialogPortal>
        </DialogPrimitive.Root>
    )
}
