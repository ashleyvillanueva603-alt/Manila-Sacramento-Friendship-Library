"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen, Clock, CheckCircle, AlertTriangle, Search, History } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface BorrowRecordWithDetails {
  id: number
  user_id: number
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  borrow_date: string
  due_date: string
  return_date: string | null
  status: string
}

function MyHistoryPage() {
  const { user } = useAuth()
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecordWithDetails[]>([])
  const [filteredHistory, setFilteredHistory] = useState<BorrowRecordWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    returned: 0,
    overdue: 0,
  })

  useEffect(() => {
    if (user) {
      loadBorrowHistory()
    }
  }, [user])

  useEffect(() => {
    filterHistory()
  }, [borrowHistory, searchTerm, statusFilter])

  const loadBorrowHistory = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log("[v0] Loading borrow history from API for user:", user.id)
      const response = await apiService.getBorrowHistory(user.id)
      console.log("[v0] Borrow history response:", response)

      const records: BorrowRecordWithDetails[] = response.records || []
      console.log("[v0] Total history records:", records.length)

      setBorrowHistory(records)

      // Calculate stats
      const totalBorrowed = records.length
      const currentlyBorrowed = records.filter((r) => r.status === "borrowed" || r.status === "").length
      const returned = records.filter((r) => r.status === "returned").length
      const overdue = records.filter((r) => r.status === "overdue").length

      setStats({
        totalBorrowed,
        currentlyBorrowed,
        returned,
        overdue,
      })
    } catch (error) {
      console.error("[v0] Error loading borrow history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = borrowHistory

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.book_author?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter)
    }

    setFilteredHistory(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "borrowed":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "returned":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "returned":
        return "bg-green-100 text-green-800 border-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateDaysWithBook = (borrowDate: string, returnDate?: string | null) => {
    const startDate = new Date(borrowDate)
    const endDate = returnDate ? new Date(returnDate) : new Date()
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Borrowing History</h1>
        <p className="text-muted-foreground">Track all your borrowed books and reading history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Borrowed</p>
                <p className="text-2xl font-bold">{stats.totalBorrowed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                <p className="text-2xl font-bold">{stats.currentlyBorrowed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Returned</p>
                <p className="text-2xl font-bold">{stats.returned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="borrowed">Currently Borrowed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{record.book_title || "Unknown Book"}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">by {record.book_author || "Unknown Author"}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Borrowed Date</p>
                        <p className="font-medium">{new Date(record.borrow_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(record.due_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Return Date</p>
                        <p className="font-medium">
                          {record.return_date ? new Date(record.return_date).toLocaleDateString() : "Not returned yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days with Book</p>
                        <p className="font-medium">
                          {calculateDaysWithBook(record.borrow_date, record.return_date)} days
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(record.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No borrowing history found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start borrowing books to see your history here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireStudent>
      <MyHistoryPage />
    </AuthGuard>
  )
}
