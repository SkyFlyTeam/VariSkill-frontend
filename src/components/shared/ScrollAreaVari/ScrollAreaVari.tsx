import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type ScrollAreaVariProps = {
    children: ReactNode
    className?: string
    label?: string
}

type ThumbInfo = {
    altura: number
    topo: number
    visivel: boolean
}

const ALTURA_MINIMA_THUMB = 48

/**
 * Área de rolagem com scrollbar própria sempre visível, no vermelho da marca.
 * O scrollbar nativo fica oculto para o desenho não depender do tema do
 * navegador (Firefox, por exemplo, usa overlay e some quando parado).
 */
export function ScrollAreaVari({
    children,
    className,
    label,
}: ScrollAreaVariProps) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const [thumb, setThumb] = useState<ThumbInfo>({
        altura: 0,
        topo: 0,
        visivel: false,
    })

    const atualizar = useCallback(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const { scrollTop, scrollHeight, clientHeight } = viewport
        const rolavel = scrollHeight - clientHeight

        if (rolavel <= 1) {
            setThumb({ altura: 0, topo: 0, visivel: false })
            return
        }

        const altura = Math.max(
            (clientHeight / scrollHeight) * clientHeight,
            ALTURA_MINIMA_THUMB,
        )
        const maxTopo = clientHeight - altura
        const topo = (scrollTop / rolavel) * maxTopo

        setThumb({ altura, topo, visivel: true })
    }, [])

    useEffect(() => {
        atualizar()

        const viewport = viewportRef.current
        if (!viewport || typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver(atualizar)
        observer.observe(viewport)
        return () => observer.disconnect()
    }, [atualizar, children])

    function rolarParaProporcao(proporcao: number) {
        const viewport = viewportRef.current
        if (!viewport) return
        const rolavel = viewport.scrollHeight - viewport.clientHeight
        viewport.scrollTop = Math.min(Math.max(proporcao, 0), 1) * rolavel
    }

    function handleTrackClick(event: React.MouseEvent<HTMLDivElement>) {
        const track = trackRef.current
        if (!track) return
        const retangulo = track.getBoundingClientRect()
        const proporcao = (event.clientY - retangulo.top) / retangulo.height
        rolarParaProporcao(proporcao)
    }

    function handleThumbDrag(event: React.PointerEvent<HTMLDivElement>) {
        event.preventDefault()
        const viewport = viewportRef.current
        const track = trackRef.current
        if (!viewport || !track) return

        const inicioY = event.clientY
        const inicioScroll = viewport.scrollTop
        const rolavel = viewport.scrollHeight - viewport.clientHeight
        const maxTopo = track.clientHeight - thumb.altura

        function mover(movimento: PointerEvent) {
            if (!viewport || maxTopo <= 0) return
            const delta = movimento.clientY - inicioY
            viewport.scrollTop = inicioScroll + (delta / maxTopo) * rolavel
        }

        function finalizar() {
            window.removeEventListener("pointermove", mover)
            window.removeEventListener("pointerup", finalizar)
        }

        window.addEventListener("pointermove", mover)
        window.addEventListener("pointerup", finalizar)
    }

    return (
        <div className={cn("relative flex min-h-0", className)}>
            <div
                ref={viewportRef}
                onScroll={atualizar}
                tabIndex={0}
                role="region"
                aria-label={label}
                className="scrollbar-none min-h-0 w-full overflow-y-auto pr-4 focus-visible:outline-none"
            >
                {children}
            </div>

            <div
                ref={trackRef}
                aria-hidden="true"
                onClick={handleTrackClick}
                className="absolute top-0 right-0 bottom-0 w-2.5 cursor-pointer rounded-full bg-[#e11d2e]/10"
            >
                {thumb.visivel && (
                    <div
                        onPointerDown={handleThumbDrag}
                        className="absolute right-0 w-2.5 rounded-full bg-[#e11d2e] transition-colors hover:bg-[#b31220]"
                        style={{ height: thumb.altura, top: thumb.topo }}
                    />
                )}
            </div>
        </div>
    )
}
