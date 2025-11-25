"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, TrendingUp, Clock } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface OverallStats {
  totalBooks: number
  availableBooks: number
  borrowedBooks: number
  totalBorrows: number
  activeUsers: number
  totalUsers: number
  averageBorrowDuration: number
  utilizationRate: number
}

export function OverallStatsCards() {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log("[v0] Loading overall stats from API...")
        const response = await apiService.getDashboardStats()

        console.log("[v0] Overall stats response:", response)

        if (response.success && response.data) {
          const data = response.data
          setStats({
            totalBooks: data.totalBooks || 0,
            availableBooks: data.availableBooks || 0,
            borrowedBooks: data.borrowedBooks || 0,
            totalBorrows: data.totalBorrows || 0,
            activeUsers: data.activeUsers || 0,
            totalUsers: data.totalUsers || 0,
            averageBorrowDuration: data.averageBorrowDuration || 0,
            utilizationRate: data.utilizationRate || 0,
          })
        }
      } catch (error) {
        console.error("[v0] Error loading overall stats:", error)
        // Set default values on error
        setStats({
          totalBooks: 0,
          availableBooks: 0,
          borrowedBooks: 0,
          totalBorrows: 0,
          activeUsers: 0,
          totalUsers: 0,
          averageBorrowDuration: 0,
          utilizationRate: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBooks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.availableBooks} available, {stats.borrowedBooks} borrowed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of {stats.totalUsers} total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Borrows</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBorrows.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Utilization rate: {stats.utilizationRate.toFixed(1)}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Borrow Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageBorrowDuration.toFixed(1)} days</div>
          <p className="text-xs text-muted-foreground">Average reading time per book</p>
        </CardContent>
      </Card>
    </div>
  )
}
