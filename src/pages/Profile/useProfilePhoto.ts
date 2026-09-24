import { type ChangeEvent, useState } from "react"

const STORAGE_KEY = "variskill:profile-photo"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB — dataURL fica ~33% maior, e o
// localStorage costuma ter só uns 5-10MB de cota por origem, então uma
// imagem próxima do limite pode estourar a cota (tratado no catch abaixo).

type UseProfilePhotoOptions = {
    onError: (message: string) => void
    onSuccess: (message: string) => void
}

export function useProfilePhoto({
    onError,
    onSuccess,
}: UseProfilePhotoOptions) {
    const [photo, setPhoto] = useState<string | null>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY)
        } catch {
            // localStorage indisponível (modo privado, cota, etc.) — segue sem foto.
            return null
        }
    })

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = "" // permite selecionar o mesmo arquivo de novo

        if (!file) return

        if (!file.type.startsWith("image/")) {
            onError("Selecione um arquivo de imagem.")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            onError("A imagem deve ter no máximo 5MB.")
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            const dataUrl = reader.result as string
            try {
                localStorage.setItem(STORAGE_KEY, dataUrl)
                setPhoto(dataUrl)
                onSuccess("Foto atualizada!")
            } catch {
                onError(
                    "Não foi possível salvar a foto (sem espaço no navegador).",
                )
            }
        }

        reader.onerror = () => onError("Não foi possível ler a imagem.")
        reader.readAsDataURL(file)
    }

    return { photo, handleFileChange }
}
