import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

/** Pixel no grid do SVG: [x, y, largura, altura, cor]. */
type Pixel = readonly [number, number, number, number, string]

const GOLD = "#FFC83D"
const GOLD_DARK = "#B7791F"
const GOLD_LIGHT = "#FFF1C2"
const RED = "#E11A2F"
const RED_DARK = "#800F0F"
const ORANGE = "#FF8A00"
const NAVY = "#001A3F"
const BLUE = "#46B6E1"
const BLUE_DARK = "#2599C8"

/** Fita e disco dourado (contorno, preenchimento e reflexo), comuns a toda medalha. */
const MEDAL_BASE: Pixel[] = [
    [4, 0, 3, 6, BLUE],
    [9, 0, 3, 6, BLUE_DARK],
    [5, 5, 6, 1, GOLD_DARK],
    [4, 6, 8, 1, GOLD_DARK],
    [3, 7, 10, 1, GOLD_DARK],
    [2, 8, 12, 6, GOLD_DARK],
    [3, 14, 10, 1, GOLD_DARK],
    [4, 15, 8, 1, GOLD_DARK],
    [5, 16, 6, 1, GOLD_DARK],
    [5, 6, 6, 1, GOLD],
    [4, 7, 8, 1, GOLD],
    [3, 8, 10, 6, GOLD],
    [4, 14, 8, 1, GOLD],
    [5, 15, 6, 1, GOLD],
    [5, 7, 2, 1, GOLD_LIGHT],
    [4, 8, 1, 2, GOLD_LIGHT],
]

const MEDAL_ICONS = {
    chama: [
        [8, 8, 1, 1, RED],
        [7, 9, 2, 1, RED],
        [7, 10, 3, 1, RED],
        [6, 11, 4, 2, RED],
        [7, 13, 2, 1, RED],
        [7, 11, 2, 2, ORANGE],
    ],
    check: [
        [10, 9, 1, 2, NAVY],
        [9, 10, 1, 2, NAVY],
        [8, 11, 1, 2, NAVY],
        [7, 12, 1, 1, NAVY],
        [6, 11, 1, 1, NAVY],
        [5, 10, 1, 1, NAVY],
    ],
    estrela: [
        [7, 8, 2, 2, RED],
        [5, 10, 6, 1, RED],
        [6, 11, 4, 2, RED],
        [5, 13, 2, 1, RED],
        [9, 13, 2, 1, RED],
    ],
} satisfies Record<string, Pixel[]>

export type MedalIcon = keyof typeof MEDAL_ICONS

/**
 * Medalha por `Conquista.categoria` (backend, VAR-106). O campo `icone` é um
 * arquivo que o front ainda não possui; categoria desconhecida = estrela.
 */
const CATEGORY_ICONS: Record<string, MedalIcon> = {
    STREAK: "chama",
    PROGRESSO: "check",
    PRECISAO: "estrela",
}

function resolveMedalIcon(categoria: string | null | undefined): MedalIcon {
    return CATEGORY_ICONS[categoria?.trim().toUpperCase() ?? ""] ?? "estrela"
}

function Pixels({ pixels }: { pixels: readonly Pixel[] }) {
    return pixels.map(([x, y, width, height, fill]) => (
        <rect
            key={`${x}-${y}-${fill}`}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
        />
    ))
}

export function PixelMedal({
    categoria,
    label,
    className,
}: {
    categoria: string | null | undefined
    label: string
    className?: string
}) {
    const icon = resolveMedalIcon(categoria)

    return (
        <svg
            role="img"
            aria-label={label}
            data-icon={icon}
            viewBox="0 0 16 17"
            shapeRendering="crispEdges"
            className={className}
        >
            <Pixels pixels={MEDAL_BASE} />
            <Pixels pixels={MEDAL_ICONS[icon]} />
        </svg>
    )
}

const GIFT: Pixel[] = [
    [1, 4, 8, 6, RED],
    [0, 3, 10, 2, RED_DARK],
    [4, 3, 2, 7, GOLD],
    [2, 1, 2, 2, GOLD],
    [6, 1, 2, 2, GOLD],
]

/** Presente pixelado usado quando a recompensa não tem imagem própria. */
export function PixelGift({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            shapeRendering="crispEdges"
            className={className}
        >
            <Pixels pixels={GIFT} />
        </svg>
    )
}

/** Brilho em cruz, no mesmo traço das estrelinhas da arte do Vari. */
export function PixelSparkle({
    color,
    className,
    style,
}: {
    color: string
    className?: string
    style?: CSSProperties
}) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 5 5"
            shapeRendering="crispEdges"
            className={cn("absolute", className)}
            style={style}
        >
            <rect x={2} y={0} width={1} height={5} fill={color} />
            <rect x={0} y={2} width={5} height={1} fill={color} />
        </svg>
    )
}
