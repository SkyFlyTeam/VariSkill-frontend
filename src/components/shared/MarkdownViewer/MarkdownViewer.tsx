import type { Components } from "react-markdown"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

function withoutNode<T extends object>(props: T): Omit<T, "node"> {
    const rest = { ...props } as Record<string, unknown>
    delete rest.node
    return rest as Omit<T, "node">
}

const components: Components = {
    h1: (props) => (
        <h1
            {...withoutNode(props)}
            className="mt-8 mb-4 text-3xl font-bold tracking-tight"
        />
    ),
    h2: (props) => (
        <h2
            {...withoutNode(props)}
            className="mt-6 mb-3 text-2xl font-bold tracking-tight"
        />
    ),
    h3: (props) => (
        <h3
            {...withoutNode(props)}
            className="mt-5 mb-2 text-xl font-semibold tracking-tight"
        />
    ),
    h4: (props) => (
        <h4
            {...withoutNode(props)}
            className="mt-4 mb-2 text-lg font-semibold tracking-tight"
        />
    ),
    p: (props) => <p {...withoutNode(props)} className="my-4 leading-7" />,
    ul: (props) => (
        <ul {...withoutNode(props)} className="my-4 list-disc space-y-1 pl-6" />
    ),
    ol: (props) => (
        <ol
            {...withoutNode(props)}
            className="my-4 list-decimal space-y-1 pl-6"
        />
    ),
    li: (props) => <li {...withoutNode(props)} className="leading-7" />,
    a: (props) => (
        <a
            {...withoutNode(props)}
            className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            target="_blank"
            rel="noreferrer"
        />
    ),
    blockquote: (props) => (
        <blockquote
            {...withoutNode(props)}
            className="my-4 border-l-4 border-border pl-4 text-muted-foreground italic"
        />
    ),
    hr: (props) => (
        <hr {...withoutNode(props)} className="my-6 border-border" />
    ),
    strong: (props) => (
        <strong {...withoutNode(props)} className="font-semibold" />
    ),
    img: (props) => (
        <img {...withoutNode(props)} className="my-4 max-w-full rounded-md" />
    ),
    pre: (props) => (
        <pre
            {...withoutNode(props)}
            className="my-4 overflow-hidden rounded-lg text-sm"
        />
    ),
    code: (props) => {
        const isBlock =
            typeof props.className === "string" &&
            props.className.includes("language-")

        return (
            <code
                {...withoutNode(props)}
                className={cn(
                    "font-mono",
                    !isBlock && "rounded bg-muted px-1.5 py-0.5 text-sm",
                    props.className,
                )}
            />
        )
    },
    table: (props) => (
        <div className="my-4 overflow-x-auto">
            <table
                {...withoutNode(props)}
                className="w-full border-collapse text-sm"
            />
        </div>
    ),
    th: (props) => (
        <th
            {...withoutNode(props)}
            className="border border-border px-3 py-2 text-left font-semibold"
        />
    ),
    td: (props) => (
        <td
            {...withoutNode(props)}
            className="border border-border px-3 py-2"
        />
    ),
}

type MarkdownViewerProps = {
    content: string
    className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    return (
        <div className={cn("markdown-viewer text-sm leading-7", className)}>
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={components}
            >
                {content}
            </Markdown>
        </div>
    )
}
