import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"

import * as authService from "@/services/authService"
import type { RegisterPayload, User } from "@/services/authService"

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => Promise<void>
    completeOnboarding: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [sessionError, setSessionError] = useState<string | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true

        authService
            .me()
            .then((currentUser) => {
                if (active) {
                    setUser(currentUser)
                }
            })
            .catch(() => {
                if (active) {
                    setUser(null)
                }
            })
            .finally(() => {
                if (active) {
                    setIsLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [])

    const login = async (email: string, password: string) => {
        const loggedUser = await authService.login(email, password)
        setUser(loggedUser)
    }

    const register = async (payload: RegisterPayload) => {
        const registeredUser = await authService.register(payload)
        setUser(registeredUser)
    }

    const logout = async () => {
        try {
            await authService.logout()
        } finally {
            setUser(null)
        }
    }

    const completeOnboarding = async () => {
        const updatedUser = await authService.completeOnboarding()
        setUser(updatedUser)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                login,
                register,
                logout,
                completeOnboarding,
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
