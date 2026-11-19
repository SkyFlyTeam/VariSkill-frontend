import { formatCpf, isValidCpf, onlyDigits } from "@/utils/validation"

describe("validação de CPF", () => {
    it("aceita CPF válido com e sem máscara", () => {
        expect(isValidCpf("529.982.247-25")).toBe(true)
        expect(isValidCpf("52998224725")).toBe(true)
    })

    it("rejeita CPF inválido e sequências repetidas", () => {
        expect(isValidCpf("123.456.789-00")).toBe(false)
        expect(isValidCpf("111.111.111-11")).toBe(false)
        expect(isValidCpf("123")).toBe(false)
    })

    it("aplica a máscara e devolve apenas dígitos quando pedido", () => {
        expect(formatCpf("52998224725")).toBe("529.982.247-25")
        expect(formatCpf("529.982.247-25123")).toBe("529.982.247-25")
        expect(onlyDigits("529.982.247-25")).toBe("52998224725")
    })
})
