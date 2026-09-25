import type { ReactNode } from "react"

import variMascot from "@/assets/vari-mascot.svg"

type AuthLayoutProps = {
    heading: string
    slogan?: string
    children: ReactNode
}

export function AuthLayout({ heading, slogan, children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-main-blue p-4">
            <div className="w-full max-w-md rounded-2xl bg-neutral-100 px-6 py-8 shadow-xl sm:px-10">
                <div className="flex items-center justify-center gap-2">
                    <img
                        src={variMascot}
                        alt="VariSkill"
                        className="h-14 w-auto"
                    />
                    <span className="font-poppins text-3xl font-bold tracking-tight text-[#001a3f]">
                        VariSkill
                    </span>
                </div>

                {slogan && (
                    <p className="mt-3 text-center text-xs text-neutral-500">
                        {slogan}
                    </p>
                )}

                <h1 className="mt-7 text-lg font-bold text-[#001a3f]">
                    {heading}
                </h1>

                <div className="mt-4">{children}</div>
            </div>
        </main>
    )
}
