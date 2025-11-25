"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api-service"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, BookOpen, Users, Clock } from "lucide-react"

interface AnalyticsData {
  borrowingTrends: Array<{ date: string; borrows: number; returns: number; rawDate: string }>
  genrePopularity: Array<{ category: string; totalBorrows: number; percentage: number }>
  topBooks: Array<{ title: string; author: string; borrowCount: number }>
  monthlyStats: {
    totalBorrows: number
    totalReturns: number
    newUsers: number
    overdueBooks: number
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "1y">("6m")
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [genreBooks, setGenreBooks] = useState<
    Array<{ title: string; author: string; borrowCount: number; coverUrl: string }>
  >([])
  const [loadingGenreBooks, setLoadingGenreBooks] = useState(false)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        console.log("[v0] Loading analytics from API...")

        const [timeSeriesResponse, categoryResponse, bookUsageResponse, overallStatsResponse] = await Promise.all([
          apiService.getAnalytics(timeRange),
          apiService.getCategoryPerformance(),
          apiService.getBookUsage(),
          apiService.getDashboardStats(),
        ])

        console.log("[v0] Time series response:", timeSeriesResponse)
        console.log("[v0] Category response:", categoryResponse)
        console.log("[v0] Book usage response:", bookUsageResponse)
        console.log("[v0] Overall stats response:", overallStatsResponse)

        const borrowingTrends =
          timeSeriesResponse.success && timeSeriesResponse.data
            ? timeSeriesResponse.data.map((item: any) => ({
                date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                borrows: item.borrows || 0,
                returns: item.returns || 0,
                rawDate: item.date,
              }))
            : []

        const genrePopularity =
          categoryResponse.success && categoryResponse.data
            ? categoryResponse.data.slice(0, 6).map((item: any) => ({
                category: item.category || "Unknown",
                totalBorrows: item.totalBorrows || 0,
                percentage: item.percentage || 0,
              }))
            : []

        const topBooks =
          bookUsageResponse.success && bookUsageResponse.data
            ? bookUsageResponse.data.slice(0, 5).map((item: any) => ({
                title: item.title || "Unknown",
                author: item.author || "Unknown",
                borrowCount: item.totalBorrows || 0,
              }))
            : []

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const monthlyBorrows =
          timeSeriesResponse.success && timeSeriesResponse.data
            ? timeSeriesResponse.data
                .filter((item: any) => {
                  const itemDate = new Date(item.date)
                  return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
                })
                .reduce((sum: number, item: any) => sum + (item.borrows || 0), 0)
            : 0

        const monthlyReturns =
          timeSeriesResponse.success && timeSeriesResponse.data
            ? timeSeriesResponse.data
                .filter((item: any) => {
                  const itemDate = new Date(item.date)
                  return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
                })
                .reduce((sum: number, item: any) => sum + (item.returns || 0), 0)
            : 0

        const monthlyStats = {
          totalBorrows: overallStatsResponse.success
            ? overallStatsResponse.data?.totalBorrows || monthlyBorrows
            : monthlyBorrows,
          totalReturns: overallStatsResponse.success
            ? overallStatsResponse.data?.totalReturns || monthlyReturns
            : monthlyReturns,
          newUsers: overallStatsResponse.success ? overallStatsResponse.data?.totalUsers || 0 : 0,
          overdueBooks: overallStatsResponse.success ? overallStatsResponse.data?.overdueBooks || 0 : 0,
        }

        console.log("[v0] Monthly stats calculated:", monthlyStats)

        setAnalytics({
          borrowingTrends,
          genrePopularity,
          topBooks,
          monthlyStats,
        })
      } catch (error) {
        console.error("[v0] Error loading analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  const handleGenreClick = async (genre: string) => {
    console.log("[v0] ========== GENRE CLICK START ==========")
    console.log("[v0] Genre clicked:", genre)
    console.log("[v0] Genre type:", typeof genre)
    console.log("[v0] Genre length:", genre?.length)

    setSelectedGenre(genre)
    setLoadingGenreBooks(true)

    try {
      const genreVariations = [
        genre, // Original
        genre.toLowerCase(), // lowercase
        genre.toUpperCase(), // UPPERCASE
        genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase(), // Title Case
      ]

      console.log("[v0] Trying genre variations:", genreVariations)

      let booksResponse = null
      let successfulGenre = null

      // Try each variation until we find books
      for (const genreVariation of genreVariations) {
        console.log("[v0] Attempting to fetch books with genre:", genreVariation)
        const response = await apiService.getBooks("", genreVariation, 100, 0)
        console.log("[v0] Response for", genreVariation, ":", response)
        console.log("[v0] Response.records:", response.records)
        console.log("[v0] Response.records.length:", response.records?.length)

        // Check if we have records (don't require success field)
        if (response.records && Array.isArray(response.records) && response.records.length > 0) {
          console.log("[v0] SUCCESS! Found", response.records.length, "books with genre:", genreVariation)
          booksResponse = response
          successfulGenre = genreVariation
          break
        } else {
          console.log("[v0] No books found with genre:", genreVariation)
        }
      }

      if (
        booksResponse &&
        booksResponse.records &&
        Array.isArray(booksResponse.records) &&
        booksResponse.records.length > 0
      ) {
        console.log("[v0] Final books found:", booksResponse.records.length)
        console.log("[v0] Sample book:", booksResponse.records[0])

        // Fetch borrow history
        console.log("[v0] Fetching borrow history...")
        const borrowHistory = await apiService.getBorrowHistory(undefined, 1000, 0)
        console.log("[v0] Borrow history response:", borrowHistory)
        console.log("[v0] Borrow history records count:", borrowHistory.records?.length || 0)

        // Build borrow counts map
        const borrowCounts = new Map<number, number>()
        if (borrowHistory.records && Array.isArray(borrowHistory.records)) {
          borrowHistory.records.forEach((record: any) => {
            const bookId = record.book_id
            borrowCounts.set(bookId, (borrowCounts.get(bookId) || 0) + 1)
          })
        }
        console.log("[v0] Borrow counts map size:", borrowCounts.size)
        console.log("[v0] Borrow counts entries:", Array.from(borrowCounts.entries()).slice(0, 10))

        // Map books with their borrow counts
        const booksWithCounts = booksResponse.records
          .map((book: any) => {
            const borrowCount = borrowCounts.get(book.id) || 0
            console.log("[v0] Book:", book.title, "ID:", book.id, "Borrow count:", borrowCount)
            return {
              title: book.title || "Unknown",
              author: book.author || "Unknown",
              borrowCount: borrowCount,
              coverUrl: book.coverUrl || book.cover_url || "",
            }
          })
          .sort((a, b) => b.borrowCount - a.borrowCount)
          .slice(0, 10)

        console.log("[v0] Top 10 books with counts:", booksWithCounts)
        console.log("[v0] Books with non-zero borrows:", booksWithCounts.filter((b) => b.borrowCount > 0).length)
        setGenreBooks(booksWithCounts)
      } else {
        console.log("[v0] No books found for any genre variation")
        setGenreBooks([])
      }
    } catch (error) {
      console.error("[v0] Error loading genre books:", error)
      setGenreBooks([])
    } finally {
      setLoadingGenreBooks(false)
      console.log("[v0] ========== GENRE CLICK END ==========")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into library usage and trends</p>
        </div>
        <div className="flex gap-2">
          {(["3m", "6m", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Borrows</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyStats.totalBorrows}</div>
            <p className="text-xs text-muted-foreground">Books borrowed this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyStats.totalReturns}</div>
            <p className="text-xs text-muted-foreground">Books returned this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyStats.newUsers}</div>
            <p className="text-xs text-muted-foreground">New registrations this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyStats.overdueBooks}</div>
            <p className="text-xs text-muted-foreground">Currently overdue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Borrowing Trends</TabsTrigger>
          <TabsTrigger value="genres">Genre Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Borrowing vs Returns Trend</CardTitle>
                <CardDescription>Daily comparison of books borrowed and returned</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.borrowingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="borrows" stroke="#0088FE" name="Borrowed" />
                    <Line type="monotone" dataKey="returns" stroke="#00C49F" name="Returned" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Borrowed Books</CardTitle>
                <CardDescription>Most popular books in the library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topBooks.map((book, index) => (
                    <div key={book.title} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground">by {book.author}</p>
                        </div>
                      </div>
                      <Badge>{book.borrowCount} borrows</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="genres" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Genre Popularity</CardTitle>
                <CardDescription>
                  Distribution of borrowed books by category (click segments or list items to see top books)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.genrePopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalBorrows"
                      onClick={(data, index) => {
                        console.log("[v0] Pie segment clicked - raw data:", data)
                        console.log("[v0] Pie segment clicked - index:", index)
                        console.log("[v0] Pie segment clicked - full event:", { data, index })

                        const category =
                          data?.category || data?.payload?.category || analytics.genrePopularity[index]?.category
                        console.log("[v0] Extracted category:", category)

                        if (category) {
                          handleGenreClick(category)
                        } else {
                          console.error("[v0] Could not extract category from clicked segment")
                        }
                      }}
                      cursor="pointer"
                    >
                      {analytics.genrePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Statistics</CardTitle>
                <CardDescription>Click on a category to see top books in that genre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.genrePopularity.map((genre, index) => (
                    <button
                      key={genre.category}
                      onClick={() => handleGenreClick(genre.category)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{genre.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{genre.totalBorrows} borrows</p>
                        <p className="text-xs text-muted-foreground">{genre.percentage}%</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={selectedGenre !== null} onOpenChange={(open) => !open && setSelectedGenre(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Top Books in {selectedGenre}</DialogTitle>
            <DialogDescription>Most borrowed books in the {selectedGenre} category</DialogDescription>
          </DialogHeader>

          {loadingGenreBooks ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : genreBooks.length > 0 ? (
            <div className="space-y-3">
              {genreBooks.map((book, index) => (
                <div key={`${book.title}-${index}`} className="flex items-center gap-3 p-3 rounded border">
                  {book.coverUrl && (
                    <img
                      src={book.coverUrl || "/placeholder.svg?height=64&width=48"}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=64&width=48"
                      }}
                    />
                  )}
                  {!book.coverUrl && (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="shrink-0">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
                    </div>
                  </div>
                  <Badge className="shrink-0 ml-2">{book.borrowCount} borrows</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No books found for this genre.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <AdminAnalyticsPage />
      </AdminLayout>
    </AuthGuard>
  )
}
