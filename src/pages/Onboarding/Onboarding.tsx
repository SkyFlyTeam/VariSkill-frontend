import { useState } from "react"

import { Navigate } from "react-router-dom"

import { VariMessageModal } from "@/components/shared/VariMessageModal/VariMessageModal"
import { useAuth } from "@/contexts/authContext"

const TRAILS_CATALOG_ROUTE = "/"

const ONBOARDING_STEPS = [
    {
        title: "Bem-vindo ao VariSkill!",
        message:
            "Olá! Eu sou o Vari, seu assistente e companheiro de jornada. Estou aqui para te apoiar e acompanhar cada conquista nos seus estudos.",
        actionLabel: "Conhecer a plataforma",
    },
    {
        title: "Seu aprendizado em Trilhas",
        message:
            "No VariSkill, o conteúdo é organizado em Trilhas de Aprendizagem (como Frontend, Backend e outras). Você avança módulo por módulo, construindo uma base sólida no seu próprio ritmo.",
        actionLabel: "Continuar",
    },
    {
        title: "Aprenda praticando e ganhe recompensas!",
        message:
            "Você estuda conceitos rápidos e fixa com exercícios reais. A cada atividade concluída, você ganha XP, mantém seu Streak diário (dias consecutivos de estudo) e acompanha sua evolução.",
        actionLabel: "Continuar",
    },
    {
        title: "Tudo pronto para começar!",
        message:
            "Agora você já conhece o básico. Escolha uma trilha no catálogo para dar seus primeiros passos no VariSkill!",
        actionLabel: "Explorar Trilhas",
    },
] as const

export function OnboardingPage() {
    const { user, completeOnboarding } = useAuth()
    const [stepIndex, setStepIndex] = useState(0)
    const [finished, setFinished] = useState(false)

    if (finished || (user !== null && !user.is_primeiro_acesso)) {
        return <Navigate to={TRAILS_CATALOG_ROUTE} replace />
    }

    async function finishOnboarding() {
        await completeOnboarding()
        setFinished(true)
    }

    function handleAdvance() {
        const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1

        if (isLastStep) {
            void finishOnboarding()
            return
        }

        setStepIndex((current) => current + 1)
    }

    const step = ONBOARDING_STEPS[stepIndex]

    return (
        <VariMessageModal
            open
            /**
             * Navegação é estritamente controlada pelos botões (avançar/pular),
             * então tentativas de fechar via Esc/clique fora são ignoradas.
             */
            onOpenChange={() => {}}
            title={step.title}
            message={step.message}
            actionLabel={step.actionLabel}
            onAction={handleAdvance}
            stepIndicator={{
                current: stepIndex + 1,
                total: ONBOARDING_STEPS.length,
            }}
            secondaryAction={{ label: "Pular tour", onClick: finishOnboarding }}
        />
    )
}
