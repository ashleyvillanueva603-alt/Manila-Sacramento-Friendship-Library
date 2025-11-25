"use client"

import type React from "react"
import { MessageSquare, History, FileText, CheckSquare, Bookmark } from "lucide-react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen, Users, BarChart3, Menu, LogOut, Home, Book, TrendingUp, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Books", href: "/admin/books", icon: Book },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Borrowing", href: "/admin/borrowing", icon: BookOpen },
  { name: "Reservations", href: "/admin/reservations", icon: Bookmark },
  { name: "Reservation Approvals", href: "/admin/reservations/approval", icon: CheckSquare },
  { name: "History", href: "/admin/history", icon: History },
  { name: "Requests", href: "/admin/requests", icon: MessageSquare },
  { name: "User Approvals", href: "/admin/user-approvals", icon: CheckSquare },
  { name: "Borrow Approvals", href: "/admin/borrow-approvals", icon: CheckSquare },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Library Cards", href: "/admin/library-cards", icon: Camera },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "w-64")}>
      <div className="flex items-center gap-2 p-6 border-b">
        <img
          src="/library-logo-new-removebg-preview.png" // <-- your image inside public folder
          alt="Book Icon"
          className="h-20 w-20 object-contain"
        />
        <h1 className="text-xl font-bold text-primary">Library Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
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
          <Link href="/" onClick={() => mobile && setSidebarOpen(false)}>
            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
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
            <h1 className="text-lg font-bold text-primary">Library Admin</h1>
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
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
