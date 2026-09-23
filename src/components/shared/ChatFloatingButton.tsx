import { useNavigate } from "react-router-dom"

import { MessageCircle } from "lucide-react"

import variMascot from "@/assets/vari/bubbleVari.svg"

export function ChatFloatingButton() {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            aria-label="Abrir chat com Vari"
            title="Abrir chat com Vari"
            onClick={() => navigate("/chat")}
            className="fixed cursor-pointer right-4 bottom-4 z-30 flex size-14 items-center justify-center transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        >
            <img src={variMascot} alt="" className="size-12" />
            <div className="absolute top-2 left-1 size-3 bg-green-500 rounded-full"></div>
        </button>
    )
}
