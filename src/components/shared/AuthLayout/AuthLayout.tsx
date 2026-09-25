import type { ReactNode } from "react"

import variMascot from "@/assets/vari-mascot.svg"

type AuthLayoutProps = {
    slogan?: string
    children: ReactNode
}

export function AuthLayout({ slogan, children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-main-blue p-4">
            <div className="flex w-full max-w-[635px] flex-col gap-[57px] rounded-[20px] bg-[#f3f4f6] px-[40px] py-[45px] shadow-xl">
                <div className="mx-auto flex h-[160px] w-[305px] flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2">
                        <img
                            src={variMascot}
                            alt="VariSkill"
                            className="h-[128px] w-[110.24px]"
                        />
                        <span className="font-poppins text-[40px] leading-[100%] font-bold tracking-normal text-[#001a3f]">
                            VariSkill
                        </span>
                    </div>

                    {slogan && (
                        <p className="text-center text-[16px] leading-[100%] font-semibold text-[#101828]">
                            {slogan}
                        </p>
                    )}
                </div>

                {children}
            </div>
        </main>
    )
}
