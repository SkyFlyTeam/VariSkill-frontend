import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"

import { ApiError } from "@/services/api"
import {
    type LoginData,
    type UserProfile,
    userService,
} from "@/services/userService"

type AuthContextType = {
    user: UserProfile | null
    isAuthenticated: boolean
    loading: boolean
    sessionError: string | null
    login: (data: LoginData) => Promise<void>
    logout: () => Promise<void>
    clearSession: () => void
    updateUser: (user: UserProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [sessionError, setSessionError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        userService
            .getSession()
            .then((profile) => {
                if (active) setUser(profile)
            })
            .catch((error: unknown) => {
                if (
                    active &&
                    !(
                        error instanceof ApiError &&
                        [401, 403].includes(error.status)
                    )
                ) {
                    setSessionError(
                        "Não foi possível conectar ao servidor. Tente entrar novamente.",
                    )
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [])

    async function login(data: LoginData) {
        const profile = await userService.login(data)
        setUser(profile)
        setSessionError(null)
    }

    async function logout() {
        await userService.logout()
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                loading,
                sessionError,
                login,
                logout,
                clearSession: () => setUser(null),
                updateUser: setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}
