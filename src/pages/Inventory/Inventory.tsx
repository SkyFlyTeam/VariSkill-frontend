import type { ReactNode } from "react"

import { useToast } from "@/components/shared/toast"
import { useAuth } from "@/contexts/authContext"
import { useAchievements } from "@/hooks/useAchievements"
import { useInventory } from "@/hooks/useInventory"
import { AchievementCard } from "@/pages/Inventory/components/AchievementCard"
import { CosmeticItemCard } from "@/pages/Inventory/components/CosmeticItemCard"
import {
    AvatarPreview,
    BorderPreview,
    TitlePreview,
} from "@/pages/Inventory/components/CosmeticPreviews"
import { InventorySection } from "@/pages/Inventory/components/InventorySection"
import type {
    InventarioCategoria,
    ItemInventario,
} from "@/services/inventoryService"

type CosmeticSectionConfig = {
    categoria: InventarioCategoria
    title: string
    emptyMessage: string
    showName: boolean
    indicatorSize: "sm" | "md"
    renderPreview: (item: ItemInventario) => ReactNode
}

const COSMETIC_SECTIONS: CosmeticSectionConfig[] = [
    {
        categoria: "avatares",
        title: "Avatares",
        emptyMessage: "Você ainda não possui avatares.",
        showName: true,
        indicatorSize: "md",
        renderPreview: (item) => (
            <AvatarPreview
                src={item.recurso_visual}
                name={item.nome}
                locked={!item.desbloqueado}
            />
        ),
    },
    {
        categoria: "bordas",
        title: "Bordas",
        emptyMessage: "Você ainda não possui bordas.",
        showName: true,
        indicatorSize: "md",
        renderPreview: (item) => (
            <BorderPreview
                src={item.recurso_visual}
                name={item.nome}
                locked={!item.desbloqueado}
            />
        ),
    },
    {
        categoria: "titulos",
        title: "Títulos",
        emptyMessage: "Você ainda não possui títulos.",
        showName: false,
        indicatorSize: "sm",
        renderPreview: (item) => (
            <TitlePreview name={item.nome} locked={!item.desbloqueado} />
        ),
    },
]

export function InventoryPage() {
    const toast = useToast()
    const { refreshUser } = useAuth()
    const {
        inventory,
        loading: inventoryLoading,
        error: inventoryError,
        equippingId,
        equip,
    } = useInventory()
    const {
        achievements,
        loading: achievementsLoading,
        error: achievementsError,
    } = useAchievements()

    async function handleSelect(item: ItemInventario) {
        if (!item.desbloqueado) {
            toast.error(
                `${item.nome} ainda está bloqueado. ${item.descricao}`.trim(),
            )
            return
        }
        if (item.equipado || equippingId) return
        const ok = await equip(item)
        if (ok) {
            // Atualiza /users/me/ para refletir o item equipado no card do usuário.
            void refreshUser()
            toast.success(`${item.nome} equipado!`)
        } else {
            toast.error(
                `Não foi possível equipar ${item.nome}. Tente novamente.`,
            )
        }
    }

    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto flex max-w-[1210px] flex-col gap-10">
                <h1 className="sr-only">Inventário</h1>

                {COSMETIC_SECTIONS.map((section) => {
                    const items = inventory[section.categoria]
                    return (
                        <InventorySection
                            key={section.categoria}
                            title={section.title}
                            loading={inventoryLoading}
                            error={inventoryError}
                            isEmpty={items.length === 0}
                            emptyMessage={section.emptyMessage}
                        >
                            {items.map((item) => (
                                <CosmeticItemCard
                                    key={item.item_id}
                                    name={item.nome}
                                    description={item.descricao}
                                    rarity={item.raridade}
                                    preview={section.renderPreview(item)}
                                    showName={section.showName}
                                    indicatorSize={section.indicatorSize}
                                    equipped={item.equipado}
                                    locked={!item.desbloqueado}
                                    pending={equippingId === item.item_id}
                                    onSelect={() => void handleSelect(item)}
                                />
                            ))}
                        </InventorySection>
                    )
                })}

                <InventorySection
                    title="Conquistas"
                    loading={achievementsLoading}
                    error={achievementsError}
                    isEmpty={achievements.length === 0}
                    emptyMessage="Nenhuma conquista cadastrada."
                >
                    {achievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                        />
                    ))}
                </InventorySection>
            </div>
        </main>
    )
}
