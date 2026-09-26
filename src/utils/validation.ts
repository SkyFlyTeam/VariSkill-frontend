const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): string | undefined {
    if (!email.trim()) {
        return "Informe o email."
    }

    if (!EMAIL_REGEX.test(email.trim())) {
        return "Email inválido."
    }

    return undefined
}

export function validateLogin(values: {
    email: string
    password: string
}): Record<string, string> {
    const errors: Record<string, string> = {}

    const emailError = validateEmail(values.email)
    if (emailError) {
        errors.email = emailError
    }

    if (!values.password) {
        errors.password = "Informe a senha."
    }

    return errors
}

export function validateRegister(values: {
    nome: string
    apelido: string
    email: string
    password: string
}): Record<string, string> {
    const errors: Record<string, string> = {}

    if (!values.nome.trim()) {
        errors.nome = "Informe o nome completo."
    }

    if (!values.apelido.trim()) {
        errors.apelido = "Informe o apelido."
    }

    const emailError = validateEmail(values.email)
    if (emailError) {
        errors.email = emailError
    }

    if (!values.password) {
        errors.password = "Informe a senha."
    }

    return errors
}
