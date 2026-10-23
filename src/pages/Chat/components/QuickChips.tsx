import { useNavigate } from "react-router-dom"

import type {
    ChatAction,
    ChatTrack,
} from "@/pages/Chat/components/MessageBubble"

type QuickChipsProps = {
    chips: string[]
    onSelect: (chip: string) => void
    // Ação da última resposta (ex.: "Ir para a trilha"): navega em vez de enviar mensagem.
    action?: ChatAction
    // Trilhas recomendadas: o chip matricula e abre a trilha direto.
    tracks?: ChatTrack[]
    onStartTrack?: (track: ChatTrack) => void
    startingTrackId?: string | null
    disabled?: boolean
}

const CHIP_PRIMARIO =
    "shrink-0 whitespace-nowrap rounded-full bg-[#e91a36] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#c9142d] disabled:cursor-not-allowed disabled:opacity-50"
const CHIP_SECUNDARIO =
    "shrink-0 whitespace-nowrap rounded-full border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#e91a36] shadow-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"

export function QuickChips({
    chips,
    onSelect,
    action,
    tracks = [],
    onStartTrack,
    startingTrackId = null,
    disabled = false,
}: QuickChipsProps) {
    const navigate = useNavigate()

    if (chips.length === 0 && !action && tracks.length === 0) return null

    return (
        <div
            role="group"
            aria-label="Sugestões rápidas"
            className="flex gap-2 overflow-x-auto pb-1"
        >
            {action && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => navigate(action.href)}
                    className={CHIP_PRIMARIO}
                >
                    {action.label}
                </button>
            )}
            {tracks.map((track) => (
                <button
                    key={track.id}
                    type="button"
                    disabled={disabled || startingTrackId !== null}
                    onClick={() => onStartTrack?.(track)}
                    className={CHIP_PRIMARIO}
                >
                    {startingTrackId === track.id
                        ? "Iniciando..."
                        : `Iniciar trilha ${track.titulo}`}
                </button>
            ))}
            {chips.map((chip) => (
                <button
                    key={chip}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(chip)}
                    className={CHIP_SECUNDARIO}
                >
                    {chip}
                </button>
            ))}
        </div>
    )
}
