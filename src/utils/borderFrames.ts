/**
 * Calibração das imagens de borda em /public/bordas. As imagens não são
 * quadradas nem têm o anel centralizado, então cada uma informa onde fica o
 * anel para o avatar ser encaixado no furo.
 *
 * Valores medidos no canal alpha de cada PNG (furo transparente + raios):
 * - `centerX` / `centerY`: centro do anel, em fração da largura / altura.
 * - `avatarDiameter`: diâmetro do avatar em fração da largura da imagem.
 *   Fica entre o furo e a borda externa do anel, para o avatar preencher o
 *   furo inteiro e a borda (desenhada por cima) cobrir a emenda.
 * - `aspectRatio`: altura / largura da imagem.
 */
export type BorderFrame = {
    centerX: number
    centerY: number
    avatarDiameter: number
    aspectRatio: number
}

const BORDER_FRAMES: Record<string, BorderFrame> = {
    "bordas/basica.png": {
        centerX: 0.551,
        centerY: 0.487,
        avatarDiameter: 0.87,
        aspectRatio: 3244 / 3404,
    },
    "bordas/flamejante.png": {
        centerX: 0.511,
        centerY: 0.523,
        avatarDiameter: 0.76,
        aspectRatio: 1916 / 1956,
    },
    "bordas/neon.png": {
        centerX: 0.477,
        centerY: 0.5,
        // Preenche até o anel roxo (~72%); o anel fino interno fica por cima.
        avatarDiameter: 0.75,
        aspectRatio: 1874 / 1950,
    },
}

/** Usado para bordas novas ainda sem calibração (anel centralizado). */
export const DEFAULT_BORDER_FRAME: BorderFrame = {
    centerX: 0.5,
    centerY: 0.5,
    avatarDiameter: 0.72,
    aspectRatio: 1,
}

/** Aceita o `recurso_visual` ("bordas/x.png") ou o caminho público ("/bordas/x.png"). */
export function getBorderFrame(borderPath: string): BorderFrame {
    const key = borderPath.replace(/^\/+/, "")
    return BORDER_FRAMES[key] ?? DEFAULT_BORDER_FRAME
}

/**
 * Posição da imagem da borda, em % do quadro (quadrado) do avatar, de modo
 * que o centro do anel coincida com o centro do avatar.
 */
export function getBorderImageStyle(frame: BorderFrame) {
    const width = 100 / frame.avatarDiameter
    const height = width * frame.aspectRatio
    return {
        width: `${width}%`,
        height: `${height}%`,
        left: `${50 - frame.centerX * width}%`,
        top: `${50 - frame.centerY * height}%`,
    }
}
