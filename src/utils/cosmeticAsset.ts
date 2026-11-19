/**
 * Converte o `recurso_visual` vindo do backend (ex.: "avatares/vari_classico.png")
 * no caminho servido a partir de /public (ex.: "/avatares/vari_classico.png").
 * URLs absolutas são mantidas.
 */
export function resolveCosmeticAsset(recursoVisual: string): string {
    if (/^https?:\/\//i.test(recursoVisual)) return recursoVisual
    return `/${recursoVisual.replace(/^\/+/, "")}`
}
