/** Remove acentos e caixa para que "analise" encontre "Análise". */
export function normalizeSearch(text: string) {
    return text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim()
}

/** Verdadeiro quando todos os termos da busca aparecem em algum dos campos da trilha. */
export function matchesTrackSearch(
    query: string,
    ...fields: Array<string | null | undefined>
) {
    const terms = normalizeSearch(query).split(/\s+/).filter(Boolean)
    if (terms.length === 0) return true
    const haystack = normalizeSearch(fields.filter(Boolean).join(" "))
    return terms.every((term) => haystack.includes(term))
}
