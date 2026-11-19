const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function onlyDigits(value: string): string {
    return (value || "").replace(/\D/g, "")
}

/** Aplica a máscara 000.000.000-00 enquanto o usuário digita. */
export function formatCpf(value: string): string {
    const digits = onlyDigits(value).slice(0, 11)
    return digits
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2")
}

/** Valida CPF pelos dígitos verificadores (mesma regra do backend). */
export function isValidCpf(value: string): boolean {
    const digits = onlyDigits(value)

    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
        return false
    }

    for (const tamanho of [9, 10]) {
        let soma = 0
        for (let indice = 0; indice < tamanho; indice += 1) {
            soma += Number(digits[indice]) * (tamanho + 1 - indice)
        }
        let resto = (soma * 10) % 11
        if (resto === 10) resto = 0
        if (resto !== Number(digits[tamanho])) {
            return false
        }
    }

    return true
}

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
    sexo: string
    idade: string
    responsavel?: {
        nome: string
        cpf: string
        email: string
    }
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

    if (!values.sexo) {
        errors.sexo = "Informe o sexo."
    }

    const idade = values.idade.trim()
    if (!idade) {
        errors.idade = "Informe a idade."
    } else if (
        !/^\d+$/.test(idade) ||
        Number(idade) < 1 ||
        Number(idade) > 120
    ) {
        errors.idade = "Idade inválida."
    }

    // Menor de 18 precisa dos dados do responsável legal.
    if (idade && Number(idade) < 18 && !errors.idade) {
        const responsavel = values.responsavel
        if (!responsavel?.nome.trim()) {
            errors["responsavel.nome"] = "Informe o nome do responsável."
        }
        if (!responsavel?.cpf.trim()) {
            errors["responsavel.cpf"] = "Informe o CPF do responsável."
        } else if (!isValidCpf(responsavel.cpf)) {
            errors["responsavel.cpf"] = "CPF inválido."
        }
        const emailResponsavel = validateEmail(responsavel?.email ?? "")
        if (emailResponsavel) {
            errors["responsavel.email"] =
                emailResponsavel === "Informe o email."
                    ? "Informe o e-mail do responsável."
                    : "E-mail do responsável inválido."
        }
    }

    return errors
}
