const ONBOARDING_COMPLETED_KEY = "variskill:onboarding-completed"

export function isOnboardingCompleted(): boolean {
    try {
        return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true"
    } catch {
        return false
    }
}

export function setOnboardingCompleted(): void {
    try {
        localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true")
    } catch {
        // localStorage indisponível (modo privado, etc.) — onboarding será exibido novamente.
    }
}
