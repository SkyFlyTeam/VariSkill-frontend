import React, { useState } from "react"

import { cn } from "cn"
import { GripVertical, X } from "lucide-react"

import { CodeFrame } from "@/components/shared/CodeFrame/CodeFrame"

export interface CodeBlockOption {
    id: string
    label: string
}

export interface CodeBlocksQuestionProps {
    questionText: string
    codeTemplate: string[]
    availableBlocks: CodeBlockOption[]
    slotAssignments: Record<number, string>
    onChangeSlotAssignments: (assignments: Record<number, string>) => void
    disabled?: boolean
    className?: string
}

export const CodeBlocksQuestion: React.FC<CodeBlocksQuestionProps> = ({
    questionText,
    codeTemplate,
    availableBlocks,
    slotAssignments,
    onChangeSlotAssignments,
    disabled = false,
    className,
}) => {
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
    const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(
        null,
    )

    const assignedBlockIds = Object.values(slotAssignments)

    const unselectedBlocks = availableBlocks.filter(
        (b) => !assignedBlockIds.includes(b.id),
    )

    const nextEmptySlotIndex = (() => {
        let slotCount = 0
        codeTemplate.forEach((line) => {
            const matches = line.match(/__SLOT_\d+__/g)
            if (matches) slotCount += matches.length
        })
        for (let i = 0; i < slotCount; i++) {
            if (!slotAssignments[i]) return i
        }
        return null
    })()

    function handleSelectBlockByClick(blockId: string) {
        if (disabled || nextEmptySlotIndex === null) return
        onChangeSlotAssignments({
            ...slotAssignments,
            [nextEmptySlotIndex]: blockId,
        })
    }

    function handleRemoveFromSlot(slotIndex: number) {
        if (disabled) return
        const updated = { ...slotAssignments }
        delete updated[slotIndex]
        onChangeSlotAssignments(updated)
    }

    function handleDragStart(e: React.DragEvent, blockId: string) {
        if (disabled) return
        e.dataTransfer.setData("text/plain", blockId)
        e.dataTransfer.effectAllowed = "move"
        setDraggedBlockId(blockId)
    }

    function handleDragEnd() {
        setDraggedBlockId(null)
        setDragOverSlotIndex(null)
    }

    function handleDragOverSlot(e: React.DragEvent, slotIndex: number) {
        if (disabled) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (dragOverSlotIndex !== slotIndex) {
            setDragOverSlotIndex(slotIndex)
        }
    }

    function handleDragLeaveSlot() {
        setDragOverSlotIndex(null)
    }

    function handleDropOnSlot(e: React.DragEvent, slotIndex: number) {
        if (disabled) return
        e.preventDefault()
        const blockId = e.dataTransfer.getData("text/plain") || draggedBlockId
        if (!blockId) return

        onChangeSlotAssignments({
            ...slotAssignments,
            [slotIndex]: blockId,
        })

        setDraggedBlockId(null)
        setDragOverSlotIndex(null)
    }

    function renderCodeLine(line: string) {
        const parts = line.split(/(__SLOT_\d+__)/g)

        return parts.map((part, pIdx) => {
            const slotMatch = part.match(/__SLOT_(\d+)__/)
            if (!slotMatch) {
                return <span key={pIdx}>{part}</span>
            }

            const slotIndex = parseInt(slotMatch[1], 10)
            const assignedBlockId = slotAssignments[slotIndex]
            const assignedBlock = availableBlocks.find(
                (b) => b.id === assignedBlockId,
            )
            const isHoveredByDrag = dragOverSlotIndex === slotIndex

            if (assignedBlock) {
                return (
                    <button
                        key={pIdx}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemoveFromSlot(slotIndex)}
                        onDragOver={(e) => handleDragOverSlot(e, slotIndex)}
                        onDragLeave={handleDragLeaveSlot}
                        onDrop={(e) => handleDropOnSlot(e, slotIndex)}
                        className={cn(
                            "mx-1 inline-flex items-center gap-1.5 rounded-[15px] border border-[#46b6e1] bg-[#46b6e1] px-3 py-1 font-mono text-xs font-bold text-white shadow-xs transition-all outline-none",
                            "hover:bg-[#269ac6] hover:border-[#269ac6] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                            isHoveredByDrag &&
                                "ring-2 ring-yellow-400 border-yellow-400 scale-105",
                        )}
                        title="Clique para desencaixar este bloco"
                    >
                        <span>{assignedBlock.label}</span>
                        <X className="size-3.5 stroke-[2.5]" />
                    </button>
                )
            }

            const isNextToFill = nextEmptySlotIndex === slotIndex

            return (
                <span
                    key={pIdx}
                    onDragOver={(e) => handleDragOverSlot(e, slotIndex)}
                    onDragLeave={handleDragLeaveSlot}
                    onDrop={(e) => handleDropOnSlot(e, slotIndex)}
                    className={cn(
                        "mx-1 inline-block min-w-[80px] border-b-2 border-dashed px-2.5 py-0.5 text-center font-mono text-xs font-semibold transition-all select-none",
                        isHoveredByDrag
                            ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 scale-110 shadow-lg"
                            : isNextToFill
                              ? "border-[#46b6e1] bg-[#46b6e1]/20 text-[#46b6e1] animate-pulse"
                              : "border-white/30 bg-black/15 text-white/60",
                    )}
                >
                    {isHoveredByDrag ? "Solte aqui!" : "____"}
                </span>
            )
        })
    }

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-6 rounded-[15px] bg-[#f9fafb] p-6 text-foreground shadow-sm dark:bg-card dark:text-foreground",
                className,
            )}
        >
            <h2 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                {questionText}
            </h2>

            <CodeFrame lines={codeTemplate} renderLine={renderCodeLine} />

            <div className="flex flex-col items-center gap-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    Blocos disponíveis:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {unselectedBlocks.length === 0 ? (
                        <span className="text-xs text-emerald-600 font-semibold dark:text-emerald-400">
                            ✓ Todos os blocos foram encaixados no código!
                        </span>
                    ) : (
                        unselectedBlocks.map((block) => (
                            <button
                                key={block.id}
                                type="button"
                                draggable={!disabled}
                                onDragStart={(e) =>
                                    handleDragStart(e, block.id)
                                }
                                onDragEnd={handleDragEnd}
                                disabled={disabled}
                                onClick={() =>
                                    handleSelectBlockByClick(block.id)
                                }
                                className={cn(
                                    /* Fundo #46b6e1 a 20% de opacidade com raio de curvatura 15px (Frames 75, 78, 79 do Figma) */
                                    "inline-flex items-center gap-2 rounded-[15px] border border-[#46b6e1]/40 bg-[#46b6e1]/20 px-5 py-2.5 font-mono text-xs sm:text-sm font-bold text-[#269ac6] shadow-xs transition-all duration-200 outline-none select-none dark:text-[#46b6e1]",
                                    "hover:border-[#46b6e1] hover:bg-[#46b6e1]/30 hover:scale-105 cursor-grab active:cursor-grabbing active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
                                    draggedBlockId === block.id &&
                                        "opacity-40 border-dashed border-[#46b6e1]",
                                )}
                            >
                                <GripVertical className="size-4 text-[#269ac6]/70 dark:text-[#46b6e1]/70" />
                                <span>{block.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
