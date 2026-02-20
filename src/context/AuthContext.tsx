import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (name: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    updateProfile: (newName: string, newAvatar?: string, newBgColor?: string) => Promise<{ success: boolean; error?: string }>
    isAdmin: boolean
    checkAdmin: (password: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_PASSWORD = 'biabio1234' // Simple client-side check as requested

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    // Load user from localStorage on mount (persistence)
    useEffect(() => {
        const storedUser = localStorage.getItem('morning_journal_user')
        const adminStatus = localStorage.getItem('morning_journal_admin')

        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        if (adminStatus === 'true') {
            setIsAdmin(true)
        }
        setLoading(false)
    }, [])

    const login = async (username: string) => {
        try {
            if (!username.trim()) return { success: false, error: 'Name is required' }

            const cleanName = username.trim()

            // MOCK MODE CHECK
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                console.log('Mock Login Mode Active')
                const mockUser = {
                    id: 'mock-user-id-' + cleanName,
                    username: cleanName,
                    created_at: new Date().toISOString()
                }
                setUser(mockUser)
                localStorage.setItem('morning_journal_user', JSON.stringify(mockUser))
                return { success: true }
            }

            // 1. Check if user exists
            let { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('username', cleanName)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Relation null" (no rows)
                console.error('Login error:', fetchError)
                return { success: false, error: fetchError.message }
            }

            let targetUser = existingUser

            // 2. If not exists, create new user
            if (!existingUser) {
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{ username: cleanName }])
                    .select()
                    .single()

                if (createError) {
                    console.error('Signup error:', createError)
                    return { success: false, error: createError.message }
                }
                targetUser = newUser
            }

            // 3. Set state and local storage
            setUser(targetUser)
            localStorage.setItem('morning_journal_user', JSON.stringify(targetUser))
            return { success: true }

        } catch (err) {
            console.error('Unexpected auth error:', err)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }

    const logout = () => {
        setUser(null)
        setIsAdmin(false)
        localStorage.removeItem('morning_journal_user')
        localStorage.removeItem('morning_journal_admin')
    }

    const updateProfile = async (newName: string, newAvatar?: string, newBgColor?: string) => {
        try {
            if (!user) return { success: false, error: 'Not logged in' }
            if (!newName.trim()) return { success: false, error: 'Name cannot be empty' }

            const cleanName = newName.trim()
            const updates: any = { username: cleanName }
            if (newAvatar) updates.avatar = newAvatar
            if (newBgColor) updates.bg_color = newBgColor

            // MOCK MODE
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                const updatedUser = { ...user, ...updates }
                setUser(updatedUser)
                localStorage.setItem('morning_journal_user', JSON.stringify(updatedUser))
                return { success: true }
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)

            if (error) {
                if (error.code === '23505') { // Unique violation
                    return { success: false, error: 'Name already taken' }
                }
                throw error
            }

            const updatedUser = { ...user, ...updates }
            setUser(updatedUser)
            localStorage.setItem('morning_journal_user', JSON.stringify(updatedUser))
            return { success: true }

        } catch (err: any) {
            console.error('Update profile error:', err)
            return { success: false, error: err.message || 'Failed to update profile' }
        }
    }

    const checkAdmin = (password: string) => {
        if (password === ADMIN_PASSWORD) {
            setIsAdmin(true)
            localStorage.setItem('morning_journal_admin', 'true')
            return true
        }
        return false
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAdmin, checkAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
