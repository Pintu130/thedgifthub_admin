"use client"

import { useLoginUserWithPermissionsMutation } from "@/lib/redux/features/post/postsApiSlice"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  success: boolean
  message: string
  user: any
  token: string
}

export const useAuth = () => {
  const [loginUserWithPermissions, { isLoading: isLoginLoading }] =
    useLoginUserWithPermissionsMutation()

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      // 1. Call login API
      const response = await loginUserWithPermissions(credentials).unwrap()

      if (!response.success || !response.user) {
        throw new Error(response.message || "Login failed")
      }

      const { user, token } = response

      // 2. Store token & user in localStorage
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      console.log("✅ User logged in:", user)
      console.log("🔐 Token stored:", token)

      return {
        success: true,
        message: response.message || "Login successful",
        user,
        token,
      }
    } catch (error: any) {
      console.error("❌ Login error:", error)
      throw error
    }
  }

  const logout = () => {
    const oldUser = localStorage.getItem("user")

    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "user",
        oldValue: oldUser,
        newValue: null,
      })
    )

    console.log("👋 User logged out and storage event dispatched")
  }

  return {
    login,
    logout,
    isLoginLoading,
  }
}

export default useAuth
