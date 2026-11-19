import { HonorTitle } from "@/components/shared/HonorTitle/HonorTitle"
import { LockOverlay } from "@/components/shared/LockOverlay/LockOverlay"
import { cn } from "@/lib/utils"
import { resolveCosmeticAsset } from "@/utils/cosmeticAsset"

type ImagePreviewProps = {
    src: string
    name: string
    locked?: boolean
}

/** Avatar exibido em círculo claro, como no perfil. */
export function AvatarPreview({
    src,
    name,
    locked = false,
}: ImagePreviewProps) {
    return (
        <span className="relative grid size-36 place-items-center overflow-hidden rounded-full border border-slate-500 bg-[#f4f4f5] sm:size-40">
            <img
                src={resolveCosmeticAsset(src)}
                alt={name}
                loading="lazy"
                className="size-[78%] object-contain"
            />
            {locked && <LockOverlay label={`${name} bloqueado`} />}
        </span>
    )
}

/** Moldura de perfil exibida sobre fundo transparente. */
export function BorderPreview({
    src,
    name,
    locked = false,
}: ImagePreviewProps) {
    return (
        <span
            className={cn(
                "relative grid size-36 place-items-center overflow-hidden sm:size-40",
                locked && "rounded-xl",
            )}
        >
            <img
                src={resolveCosmeticAsset(src)}
                alt={name}
                loading="lazy"
                className="size-full object-contain"
            />
            {locked && <LockOverlay label={`${name} bloqueada`} />}
        </span>
    )
}

type TitlePreviewProps = { name: string; locked?: boolean }

export function TitlePreview({ name, locked = false }: TitlePreviewProps) {
    return <HonorTitle title={name} locked={locked} />
}
