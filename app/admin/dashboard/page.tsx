"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/lib/api-service"
import { BookOpen, Users, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalBooks: number
  totalUsers: number
  activeBorrows: number
  overdueBooks: number
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrows: 0,
    overdueBooks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log("[v0] Loading dashboard stats from API...")
        const response = await apiService.getDashboardStats()

        console.log("[v0] Dashboard stats response:", response)

        if (response.success && response.data) {
          const data = response.data
          setStats({
            totalBooks: data.totalBooks || 0,
            totalUsers: data.totalUsers || 0,
            activeBorrows: data.borrowedBooks || 0,
            overdueBooks: 0, // Will be calculated from borrow history
          })

          // Load overdue count separately
          const borrowHistory = await apiService.getBorrowHistory()
          if (borrowHistory.success && borrowHistory.records) {
            const now = new Date()
            const overdueCount = borrowHistory.records.filter((record: any) => {
              if (record.status === "returned" || !record.due_date) return false
              const dueDate = new Date(record.due_date)
              return dueDate < now
            }).length

            setStats((prev) => ({ ...prev, overdueBooks: overdueCount }))
          }
        }
      } catch (error) {
        console.error("[v0] Error loading dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      description: "Books in collection",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Library Members",
      value: stats.totalUsers,
      description: "Registered students",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Borrows",
      value: stats.activeBorrows,
      description: "Currently borrowed",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Overdue Books",
      value: stats.overdueBooks,
      description: "Need attention",
      icon: Clock,
      color: "text-red-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your library system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/books">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Add New Book</p>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/users">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Manage Users</p>
                  </div>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <span className="text-sm text-muted-foreground">Auto-saved</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <span className="text-sm font-medium">1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <AdminDashboardPage />
      </AdminLayout>
    </AuthGuard>
  )
}
