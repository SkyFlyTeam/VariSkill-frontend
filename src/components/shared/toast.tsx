import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useState,
} from "react"

import { CircleAlert, CircleCheck } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastType = "success" | "error"

type ToastItem = { id: number; type: ToastType; message: string }

type ToastContextType = {
    success: (message: string) => void
    error: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let nextId = 0

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const push = useCallback((type: ToastType, message: string) => {
        const id = nextId++
        setToasts((current) => [...current, { id, type, message }])
        setTimeout(
            () => setToasts((current) => current.filter((t) => t.id !== id)),
            4000,
        )
    }, [])

    const value = {
        success: (message: string) => push("success", message),
        error: (message: string) => push("error", message),
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                role="status"
                aria-live="polite"
                className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg",
                            toast.type === "success"
                                ? "bg-emerald-600"
                                : "bg-brand-red",
                        )}
                    >
                        {toast.type === "success" ? (
                            <CircleCheck className="size-4" />
                        ) : (
                            <CircleAlert className="size-4" />
                        )}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }

    return context
}
