"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { BookOpen, Sparkles } from "lucide-react"

export default function LoginPage() {
  const { user, isAdmin, isBorrower } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else if (isBorrower) {
        router.push("/")
      } else {
        router.push("/")
      }
    }
  }, [user, isAdmin, isBorrower, router])

  const handleAuthSuccess = () => {
    if (isAdmin) {
      router.push("/admin/dashboard")
    } else {
      router.push("/")
    }
    router.refresh()
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden">
      {/* ✅ Full background image covering the page */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage:
            "url('/library-bg.png'",
        }}
      ></div>

      {/* ✅ Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      {/* ✅ Left side content: logo + intro text (60%) */}
      <div className="relative z-10 w-full md:w-[60%] text-center md:text-left text-white px-8 md:px-20 py-16 space-y-6">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-3">
              <img
                src="/library-logo-new-removebg-preview.png" // <-- your image inside public folder
                alt="Book Icon"
                className="h-20 w-20 object-contain"
              />
            <div>
              <h1 className="text-3xl font-bold">Manila Sacramento</h1>
              <p className="text-sm text-gray-200">Friendship Library</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-sm font-medium w-fit">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            Welcome back to your library
          </div>

          <p className="max-w-md text-gray-200 text-sm leading-relaxed">
            Explore knowledge, track your borrowed books, and access your academic resources — all in one place.
          </p>
        </div>
      </div>

      {/* ✅ Right side: login/register form (40%) */}
      <div className="relative z-10 w-full md:w-[100%] flex justify-center items-center px-6 md:px-16 py-10 md:py-0">
        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
