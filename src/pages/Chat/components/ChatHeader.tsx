import { ChatAvatar } from "@/pages/Chat/components/ChatAvatar"

type ChatHeaderProps = {
    assistantName: string
    status: string
}

export function ChatHeader({ assistantName, status }: ChatHeaderProps) {
    return (
        <header className="flex items-center gap-4 rounded-2xl bg-white px-5 py-3.5 shadow-[0_3px_8px_rgba(15,23,42,0.08)] sm:px-6">
            <ChatAvatar />
            <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-900">
                    {assistantName}
                </h1>
                <p className="mt-1 flex items-center gap-1 rounded-full text-[10px] text-slate-500">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {status}
                </p>
            </div>
        </header>
    )
}
