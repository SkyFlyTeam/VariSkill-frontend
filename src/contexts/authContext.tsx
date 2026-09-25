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

import * as authService from "@/services/authService"
import type { RegisterPayload, User } from "@/services/authService"

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    login: (apelido: string, password: string) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [sessionError, setSessionError] = useState<string | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)

    const login = async (apelido: string, password: string) => {
        const loggedUser = await authService.login(apelido, password)
        setUser(loggedUser)
    }

    const register = async (payload: RegisterPayload) => {
        const registeredUser = await authService.register(payload)
        setUser(registeredUser)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                register,
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
