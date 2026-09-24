// MOCK-TEMP — arquivo inteiro deve ser DELETADO quando o login real (sessão)
// estiver plugado (ver authContext.tsx). O backend já tem /users/me e os
// campos nome/apelido/email/xp_total/streak_dias — falta só a autenticação
// de verdade pro fetch conseguir mandar a sessão certa (ver userService.ts).
import type { UserProfile } from "@/services/userService"

let mockProfile: UserProfile = {
    id: "mock-1",
    nome: "Joe Doe",
    apelido: "Joe",
    email: "joe.doe@example.com",
    dataCadastro: "2026-01-01T00:00:00.000Z",
    xpTotal: 1240,
    diasOfensiva: 7,
}

export function getMockProfile(): UserProfile {
    return mockProfile
}

export function updateMockProfile(data: Partial<UserProfile>): UserProfile {
    mockProfile = { ...mockProfile, ...data }
    return mockProfile
}
