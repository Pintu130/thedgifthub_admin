"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Loader from "@/components/loading-screen"
import { onAuthStateChangedListener, signOut, getCurrentUser } from "@/lib/firebase-auth"
import type { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: async () => {},
  refreshAuth: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const logout = async () => {
    await signOut()
    setUser(null)
    setIsAuthenticated(false)
    if (pathname !== "/login") {
      router.push("/login")
    }
  }

  const refreshAuth = () => {
    // Force re-check of current user
    const current = getCurrentUser()
    setUser(current)
    setIsAuthenticated(!!current)
  }

  // ✅ Firebase onAuthStateChanged will handle login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      setUser(firebaseUser)
      setIsAuthenticated(!!firebaseUser)
      setIsLoading(false)
      setIsInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  // ✅ Redirect logic
  useEffect(() => {
    if (!isInitialized) return

    const publicRoutes = ["/login"]
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login")
    } else if (isAuthenticated && pathname === "/login") {
      router.replace("/dashboard")
    }
  }, [pathname, isInitialized, isAuthenticated, router])

  if (isLoading) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
