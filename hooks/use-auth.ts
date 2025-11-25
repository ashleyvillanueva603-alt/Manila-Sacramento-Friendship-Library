"use client"

import { useState, useEffect } from "react"
import { authService, type AuthUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBorrower, setIsBorrower] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsAdmin(authService.isAdmin())
    setIsBorrower(authService.isBorrower())
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password)
    setUser(user)
    setIsAdmin(authService.isAdmin())
    setIsBorrower(authService.isBorrower())
    return user
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    additionalInfo?: {
      studentId?: string
      address?: string
      school?: string
      educationLevel?: string
      professionalCategory?: string | null
      phoneNumber?: string
      age?: number
      sex?: string
      birthDate?: string
    },
  ) => {
    const user = await authService.register(email, password, name, additionalInfo)
    setUser(user)
    setIsAdmin(authService.isAdmin())
    setIsBorrower(authService.isBorrower())
    return user
  }

  const refreshUser = async () => {
    const refreshedUser = await authService.refreshUserData()
    if (refreshedUser) {
      setUser(refreshedUser)
      setIsAdmin(authService.isAdmin())
      setIsBorrower(authService.isBorrower())
    }
    return refreshedUser
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAdmin(false)
    setIsBorrower(false)
    router.push("/login")
    router.refresh()
    setTimeout(() => {
      window.location.href = "/login"
    }, 100)
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin,
    isBorrower,
  }
}
