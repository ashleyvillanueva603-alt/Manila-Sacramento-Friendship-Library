"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  History,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { db, seedDatabase } from "@/lib/database"
import { apiService } from "@/lib/api-service"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalBooks: number
  activeMembers: number
  activeBorrows?: number
}

function HomePage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeMembers: 0,
    activeBorrows: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("[v0] Initializing database with sample data...")
        await seedDatabase()
        console.log("[v0] Database seeded successfully")

        const totalBooks = await db.books.count()
        const totalUsers = await db.users.count()

        let activeBorrows = 0
        if (user?.role === "student" && user?.id) {
          try {
            const response = await apiService.getBorrowHistory(user.id)
            const allBorrows = response.records || []
            activeBorrows = allBorrows.filter((borrow: any) => !borrow.return_date).length
          } catch (error) {
            console.error("[v0] Error loading borrow count:", error)
          }
        }

        setStats({
          totalBooks,
          activeMembers: totalUsers,
          activeBorrows,
        })
      } catch (error) {
        console.log("[v0] Database seeding error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeDatabase()
  }, [user])

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg-dark">
      <header className="sticky top-0 z-50 glass-effect dark:glass-effect-dark border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/library-logo-new-removebg-preview.png" alt="Book Icon" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Manila Sacramento Friendship Library</h1>
              <p className="text-xs text-muted-foreground">Modern Library Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "librarian" ? "Librarian" : "Student"}
                {user?.studentId && ` • ${user.studentId}`}
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="rounded-full bg-transparent">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Welcome to your dashboard
          </div>
          <h2 className="text-4xl font-bold mb-4 text-balance">
            {user?.role === "librarian" ? "Manage Your Library System" : "Discover Your Next Great Read"}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            {user?.role === "librarian"
              ? "Streamline operations, track analytics, and provide exceptional service to your students"
              : "Browse our extensive collection, track your reading journey, and never miss a return date"}
          </p>
        </div>

        {user?.role === "librarian" && <div className="mb-12"></div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {user?.role === "librarian" ? (
            <>
              <Link href="/admin/dashboard">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary/60" />
                    </div>
                    <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                    <CardDescription className="text-base">
                      View comprehensive library statistics and insights
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/books">
                <Card className="card-hover border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-secondary/20 rounded-xl">
                        <BookOpen className="h-6 w-6 text-secondary" />
                      </div>
                      <Star className="h-5 w-5 text-secondary/60" />
                    </div>
                    <CardTitle className="text-xl">Book Collection</CardTitle>
                    <CardDescription className="text-base">
                      Add, edit, and organize your library's collection
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="card-hover border-0 bg-gradient-to-br from-accent/5 to-accent/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-accent/20 rounded-xl">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <Users className="h-5 w-5 text-accent/60" />
                    </div>
                    <CardTitle className="text-xl">Student Management</CardTitle>
                    <CardDescription className="text-base">
                      Manage student accounts and library memberships
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/requests">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <Clock className="h-5 w-5 text-primary/60" />
                    </div>
                    <CardTitle className="text-xl">Book Requests</CardTitle>
                    <CardDescription className="text-base">Review and process student book requests</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/history">
                <Card className="card-hover border-0 bg-gradient-to-br from-secondary/5 to-accent/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-secondary/20 rounded-xl">
                        <History className="h-6 w-6 text-secondary" />
                      </div>
                      <BarChart3 className="h-5 w-5 text-secondary/60" />
                    </div>
                    <CardTitle className="text-xl">Borrowing History</CardTitle>
                    <CardDescription className="text-base">
                      Complete masterlist of all library transactions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/analytics">
                <Card className="card-hover border-0 bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-accent/20 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-accent" />
                      </div>
                      <Sparkles className="h-5 w-5 text-accent/60" />
                    </div>
                    <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                    <CardDescription className="text-base">Deep insights and trend analysis</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link href="/books">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <Star className="h-5 w-5 text-primary/60" />
                    </div>
                    <CardTitle className="text-xl">Browse Collection</CardTitle>
                    <CardDescription className="text-base">
                      Explore thousands of books across all genres
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/my-books">
                <Card className="card-hover border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-secondary/20 rounded-xl">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                      <Clock className="h-5 w-5 text-secondary/60" />
                    </div>
                    <CardTitle className="text-xl">My Books</CardTitle>
                    <CardDescription className="text-base">Track your current loans and due dates</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/my-history">
                <Card className="card-hover border-0 bg-gradient-to-br from-accent/5 to-accent/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-accent/20 rounded-xl">
                        <History className="h-6 w-6 text-accent" />
                      </div>
                      <BarChart3 className="h-5 w-5 text-accent/60" />
                    </div>
                    <CardTitle className="text-xl">Reading History</CardTitle>
                    <CardDescription className="text-base">View your complete borrowing history</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/request-book">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <Sparkles className="h-5 w-5 text-primary/60" />
                    </div>
                    <CardTitle className="text-xl">Request Books</CardTitle>
                    <CardDescription className="text-base">Suggest new additions to our collection</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/profile">
                <Card className="card-hover border-0 bg-gradient-to-br from-secondary/5 to-accent/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-secondary/20 rounded-xl">
                        <Settings className="h-6 w-6 text-secondary" />
                      </div>
                      <Users className="h-5 w-5 text-secondary/60" />
                    </div>
                    <CardTitle className="text-xl">My Profile</CardTitle>
                    <CardDescription className="text-base">Manage your account and preferences</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </>
          )}
        </div>

        {user?.role === "librarian" ? (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {loading ? "..." : stats.totalBooks.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Books Available</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-secondary mb-2">
                {loading ? "..." : stats.activeMembers.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {loading ? "..." : stats.activeBorrows?.toLocaleString() || "0"}
              </div>
              <div className="text-muted-foreground">Currently Borrowed Books</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-secondary mb-2">
                {loading ? "..." : stats.totalBooks.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Books in Collection</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <HomePage />
}
