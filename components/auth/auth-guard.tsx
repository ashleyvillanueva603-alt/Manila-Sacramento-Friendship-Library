"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { useState } from "react"
import { initializeDatabase } from "@/lib/database"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [dbInitialized, setDbInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeDatabase().then(() => setDbInitialized(true))
  }, [])

  const handleAuthSuccess = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser.role === "librarian") {
      router.push("/")
    } else {
      router.push("/")
    }
    router.refresh()
  }

  if (loading || !dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg dark:gradient-bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg dark:gradient-bg-dark">
        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    )
  }

  if (requireAdmin && user.role !== "librarian") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg dark:gradient-bg-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need librarian privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
