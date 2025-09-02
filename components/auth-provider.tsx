"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Loader from "@/components/loading-screen"

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  logout: () => void
  refreshAuth: () => void // Add this method to manually refresh auth
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {},
  refreshAuth: () => {},
})

export const useAuth = () => useContext(AuthContext)

// ✅ JWT Expiry Check Function
function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".")
    const decoded = JSON.parse(atob(payload))
    const exp = decoded.exp
    const now = Math.floor(Date.now() / 1000)
    return exp < now
  } catch (error) {
    return true // If token is invalid, treat it as expired
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)

    // Only redirect if not already on login page
    if (pathname !== "/login") {
      router.push("/login")
    }
  }

  // ✅ Check token from localStorage and decode exp
  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")


      if (token && userData) {
        const expired = isTokenExpired(token)
        if (expired) {
          // Token expired, clear everything
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setUser(null)
          setIsAuthenticated(false)
        } else {
          // Valid token and user data
          setUser(JSON.parse(userData))
          setIsAuthenticated(true)
        }
      } else {
        // No token or user data
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      // Clear invalid data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setIsAuthenticated(false)
    }

    setIsLoading(false)
    setIsInitialized(true)
  }

  // ✅ Refresh auth method that can be called externally
  const refreshAuth = () => {
    console.log("Refreshing auth state...")
    checkAuth()
  }

  // ✅ Listen for localStorage changes (for when login happens in another tab or component)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        checkAuth()
      }
    }

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events (for same-tab changes)
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener("authChange", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("authChange", handleAuthChange)
    }
  }, [])

  // ✅ Initial auth check
  useEffect(() => {
    checkAuth()

    // ✅ Optional: set interval to keep checking every minute
    const interval = setInterval(() => {
      const token = localStorage.getItem("token")
      if (token && isTokenExpired(token)) {
        logout()
      }
    }, 60000) // every 60 seconds

    return () => clearInterval(interval)
  }, [])

  // ✅ Handle redirects after initialization
  useEffect(() => {
    if (!isInitialized) return

    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    const hasValidAuth = token && userData && !isTokenExpired(token)


    // Public routes that don't require authentication
    const publicRoutes = ["/login"]
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!hasValidAuth && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      router.replace("/login")
    } else if (hasValidAuth && pathname === "/login") {
      // Authenticated but on login page
      router.replace("/dashboard")
    }
  }, [pathname, router, isInitialized, isAuthenticated])

  // Show loader while checking authentication
  if (!isInitialized) {
    return <Loader />
  }

  // If not authenticated and not on login page, show loader while redirecting
  if (!isAuthenticated && pathname !== "/login") {
    return <Loader />
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, logout, refreshAuth }}>{children}</AuthContext.Provider>
}
