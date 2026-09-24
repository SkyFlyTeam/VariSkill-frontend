import { type FormEvent, useState } from "react"

import { SendHorizonal } from "lucide-react"

type ChatComposerProps = {
    onSend: (content: string) => void
    placeholder?: string
}

export function ChatComposer({
    onSend,
    placeholder = "Digite sua dúvida...",
}: ChatComposerProps) {
    const [value, setValue] = useState("")

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const content = value.trim()

        if (!content) return

        onSend(content)
        setValue("")
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex min-h-16 items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-[0_3px_8px_rgba(15,23,42,0.08)] sm:px-6"
        >
            <label htmlFor="chat-message" className="sr-only">
                {placeholder}
            </label>
            <textarea
                id="chat-message"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                    }
                }}
                placeholder={placeholder}
                rows={1}
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-500"
            />
            <button
                type="submit"
                aria-label="Enviar mensagem"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#48b7de] text-white transition-colors hover:bg-[#319fc7] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!value.trim()}
            >
                <SendHorizonal className="size-5" />
            </button>
        </form>
    )
}
