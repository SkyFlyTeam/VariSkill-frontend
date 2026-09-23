import variMascot from "@/assets/vari/neutralVari.svg"

type ChatAvatarProps = {
    size?: "sm" | "md"
}

export function ChatAvatar({ size = "md" }: ChatAvatarProps) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#48b7de] ${
                size === "sm" ? "size-10" : "size-14"
            }`}
        >
            <img
                src={variMascot}
                alt=""
                className={size === "sm" ? "h-7 w-7" : "h-10 w-10"}
            />
        </div>
    )
}
