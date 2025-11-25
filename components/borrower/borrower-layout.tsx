"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen, User, History, Menu, LogOut, Home, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface BorrowerLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Browse Books", href: "/books", icon: BookOpen },
  { name: "My Books", href: "/my-books", icon: History },
  { name: "My Reservations", href: "/my-reservations", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: User },
]

export function BorrowerLayout({ children }: BorrowerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navigationLoading, setNavigationLoading] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = async (href: string) => {
    if (href === pathname) return

    setNavigationLoading(href)
    setSidebarOpen(false)

    try {
      router.push(href)
      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setNavigationLoading(null)
    }
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "w-64")}>
      <div className="flex items-center gap-2 p-6 border-b">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold text-primary">Library</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isLoading = navigationLoading === item.href

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Icon className="h-4 w-4" />}
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">{user?.name?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => handleNavigation("/")} disabled={navigationLoading === "/"} className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
              {navigationLoading === "/" ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Home className="h-4 w-4 mr-2" />
              )}
              Dashboard
            </Button>
          </button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r bg-card">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-primary">Library</h1>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {navigationLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-muted-foreground">Loading page...</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
