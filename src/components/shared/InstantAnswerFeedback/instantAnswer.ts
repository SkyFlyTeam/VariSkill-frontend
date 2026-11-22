/** Origem de uma resposta reaproveitada de uma dúvida já assimilada (cache semântico). */
export const ORIGEM_CACHE_SEMANTICO = "CACHE_SEMANTICO"

/**
 * Id da dúvida assimilada quando a resposta veio do cache semântico; undefined caso contrário.
 * Só essas respostas exibem o indicador de resposta instantânea e aceitam feedback.
 */
export function instantAnswerId(
    origem?: string | null,
    duvidaAssimiladaId?: string | null,
): string | undefined {
    if (origem !== ORIGEM_CACHE_SEMANTICO || !duvidaAssimiladaId)
        return undefined
    return duvidaAssimiladaId
}
