"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { BookOpen, Clock, CheckCircle, AlertTriangle, Search, User, History } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface BorrowRecordWithDetails {
  id: number
  user_id: number
  user_name: string
  user_email: string
  book_id: number
  book_title: string
  book_author: string
  book_genre?: string
  borrow_date: string
  due_date: string
  return_date: string | null
  status: string
}

const toDate = (date: Date | string | number | undefined): Date => {
  if (!date) return new Date()
  if (date instanceof Date) return date
  return new Date(date)
}

function AdminHistoryPage() {
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecordWithDetails[]>([])
  const [filteredHistory, setFilteredHistory] = useState<BorrowRecordWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([])
  const [stats, setStats] = useState({
    totalRecords: 0,
    currentlyBorrowed: 0,
    returned: 0,
    overdue: 0,
  })

  useEffect(() => {
    loadBorrowHistory()
    loadUsers()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [borrowHistory, searchTerm, statusFilter, userFilter])

  const loadUsers = async () => {
    try {
      console.log("[v0] Loading users from API...")
      const response = await apiService.getUsers()

      if (response.success && response.records) {
        const studentUsers = response.records
          .filter((user: any) => user.role === "student")
          .map((user: any) => ({
            id: user.id,
            name: user.name,
          }))
        setUsers(studentUsers)
        console.log("[v0] Loaded users:", studentUsers.length)
      }
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    }
  }

  const loadBorrowHistory = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading borrow history from API...")
      const response = await apiService.getBorrowHistory()

      console.log("[v0] Borrow history response:", response)

      if (!response.success || !response.records) {
        console.log("[v0] No borrow records found")
        setBorrowHistory([])
        setStats({ totalRecords: 0, currentlyBorrowed: 0, returned: 0, overdue: 0 })
        return
      }

      const recordsWithDetails: BorrowRecordWithDetails[] = response.records.map((record: any) => {
        // Calculate status based on dates
        let status = record.status || "borrowed"
        if (status === "borrowed") {
          const today = new Date()
          const dueDate = new Date(record.due_date || record.dueDate)
          if (today > dueDate) {
            status = "overdue"
          }
        }

        return {
          id: record.id,
          user_id: record.user_id || record.userId,
          user_name: record.user_name || record.userName || "Unknown User",
          user_email: record.user_email || record.userEmail || "",
          book_id: record.book_id || record.bookId,
          book_title: record.book_title || record.bookTitle || "Unknown Book",
          book_author: record.book_author || record.bookAuthor || "Unknown Author",
          book_genre: record.book_genre || record.bookGenre,
          borrow_date: record.borrow_date || record.borrowDate,
          due_date: record.due_date || record.dueDate,
          return_date: record.return_date || record.returnDate || null,
          status: status,
        }
      })

      setBorrowHistory(recordsWithDetails)

      // Calculate stats
      const totalRecords = recordsWithDetails.length
      const currentlyBorrowed = recordsWithDetails.filter((r) => r.status === "borrowed").length
      const returned = recordsWithDetails.filter((r) => r.status === "returned").length
      const overdue = recordsWithDetails.filter((r) => r.status === "overdue").length

      setStats({
        totalRecords,
        currentlyBorrowed,
        returned,
        overdue,
      })

      console.log("[v0] Loaded borrow history:", totalRecords, "records")
    } catch (error) {
      console.error("[v0] Error loading borrow history:", error)
      setBorrowHistory([])
      setStats({ totalRecords: 0, currentlyBorrowed: 0, returned: 0, overdue: 0 })
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
          record.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.book_author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter)
    }

    // Filter by user
    if (userFilter !== "all") {
      filtered = filtered.filter((record) => record.user_id.toString() === userFilter)
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

  const calculateDaysWithBook = (borrowDate: Date | string | number, returnDate?: Date | string | number) => {
    const endDate = returnDate ? toDate(returnDate) : new Date()
    const startDate = toDate(borrowDate)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Borrowing History</h1>
        <p className="text-muted-foreground">Complete record of all book borrowing activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.totalRecords}</p>
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book title, author, or user name..."
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
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
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
                      <h3 className="text-lg font-semibold">{record.book_title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-2">by {record.book_author}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{record.user_name}</span>
                      <span className="text-muted-foreground">({record.user_email})</span>
                    </div>

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

                    {record.book_genre && (
                      <Badge variant="outline" className="text-xs">
                        {record.book_genre}
                      </Badge>
                    )}
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
                {searchTerm || statusFilter !== "all" || userFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No borrowing records exist yet."}
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
    <AuthGuard requireLibrarian>
      <AdminLayout>
        <AdminHistoryPage />
      </AdminLayout>
    </AuthGuard>
  )
}
