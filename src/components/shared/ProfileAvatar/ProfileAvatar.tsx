import type { ReactNode } from "react"

import neutralVari from "@/assets/vari/neutralVari.svg"
import { cn } from "@/lib/utils"
import { getBorderFrame, getBorderImageStyle } from "@/utils/borderFrames"

export type ProfileAvatarProps = {
    /** URL do avatar equipado. Sem valor, usa o Vari neutro. */
    avatarUrl?: string
    /** URL da borda equipada, desenhada por cima e ao redor do avatar. */
    borderUrl?: string
    /** Classes de tamanho do círculo do avatar (ex.: "size-12"). */
    className?: string
    /** Elementos sobrepostos, como o selo de nível. */
    children?: ReactNode
}

/**
 * Avatar circular do usuário com a borda cosmética opcional. O círculo do
 * avatar mantém o tamanho recebido; a borda é escalada e posicionada a partir
 * da calibração da imagem para o anel envolver exatamente o avatar.
 */
export function ProfileAvatar({
    avatarUrl,
    borderUrl,
    className,
    children,
}: ProfileAvatarProps) {
    return (
        <div
            data-slot="profile-avatar"
            className={cn("relative shrink-0", className)}
        >
            <div
                className={cn(
                    "grid size-full place-items-center overflow-hidden rounded-full",
                    avatarUrl ? "bg-[#f4f4f5]" : "bg-[#e9c8f7]",
                )}
            >
                <img
                    src={avatarUrl ?? neutralVari}
                    alt=""
                    className="size-[80%] object-contain"
                />
            </div>
            {borderUrl && (
                <img
                    src={borderUrl}
                    alt=""
                    data-slot="profile-border"
                    className="pointer-events-none absolute max-w-none"
                    style={getBorderImageStyle(getBorderFrame(borderUrl))}
                />
            )}
            {children}
        </div>
    )
}
