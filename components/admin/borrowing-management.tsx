"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiService } from "@/lib/api-service"
import { Search, Calendar, UserIcon, BookOpen } from "lucide-react"

interface BorrowRecordWithDetails {
  id: number
  user_id: number
  user_name: string
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  borrow_date: string
  due_date: string
  return_date: string | null
  status: string
}

export function BorrowingManagement() {
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecordWithDetails[]>([])
  const [overdueBooks, setOverdueBooks] = useState<BorrowRecordWithDetails[]>([])
  const [recentReturns, setRecentReturns] = useState<BorrowRecordWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadBorrowingData = async () => {
    try {
      console.log("[v0] Loading borrowing data from API...")
      const response = await apiService.getBorrowHistory()

      console.log("[v0] Borrow history response:", response)

      const records = response.records || []

      if (records.length === 0) {
        console.log("[v0] No borrow records found")
        setActiveBorrows([])
        setOverdueBooks([])
        setRecentReturns([])
        return
      }

      // Map API response to component format
      const allBorrows: BorrowRecordWithDetails[] = records.map((record: any) => {
        // Calculate status based on dates
        let status = record.status || "borrowed"
        if (status === "borrowed" || status === "") {
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
          book_id: record.book_id || record.bookId,
          book_title: record.book_title || record.bookTitle || "Unknown Book",
          book_author: record.book_author || record.bookAuthor || "Unknown Author",
          book_cover: record.book_cover || record.bookCover || "/placeholder.svg",
          borrow_date: record.borrow_date || record.borrowDate,
          due_date: record.due_date || record.dueDate,
          return_date: record.return_date || record.returnDate || null,
          status: status,
        }
      })

      // Filter by search term if provided
      const filtered = searchTerm
        ? allBorrows.filter(
            (borrow) =>
              borrow.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              borrow.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              borrow.book_author.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : allBorrows

      // Separate into categories
      const active = filtered.filter((borrow) => borrow.status === "borrowed")
      const overdue = filtered.filter((borrow) => borrow.status === "overdue")
      const recent = filtered
        .filter((borrow) => borrow.status === "returned")
        .sort((a, b) => {
          const dateA = a.return_date ? new Date(a.return_date).getTime() : 0
          const dateB = b.return_date ? new Date(b.return_date).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 20)

      console.log("[v0] Active borrows:", active.length)
      console.log("[v0] Overdue books:", overdue.length)
      console.log("[v0] Recent returns:", recent.length)

      setActiveBorrows(active)
      setOverdueBooks(overdue)
      setRecentReturns(recent)
    } catch (error) {
      console.error("[v0] Error loading borrowing data:", error)
      setActiveBorrows([])
      setOverdueBooks([])
      setRecentReturns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBorrowingData()
  }, [searchTerm])

  const handleForceReturn = async (borrowId: number) => {
    if (confirm("Are you sure you want to force return this book?")) {
      try {
        const result = await apiService.returnBook(borrowId)
        if (result.success) {
          alert("Book returned successfully")
          loadBorrowingData()
        } else {
          alert(result.message || "Failed to return book")
        }
      } catch (error) {
        console.error("[v0] Error returning book:", error)
        alert("Failed to return book")
      }
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Borrowing Management</h2>
          <p className="text-muted-foreground">Monitor and manage book borrowing activities</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by book title, author, or borrower..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Borrows ({activeBorrows.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueBooks.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Returns ({recentReturns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBorrows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active borrows</h3>
                <p className="text-muted-foreground">No books are currently borrowed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeBorrows.map((borrow) => {
                const daysUntilDue = getDaysUntilDue(borrow.due_date)
                return (
                  <Card key={borrow.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{borrow.book_title}</h3>
                            <Badge variant={daysUntilDue <= 3 ? "secondary" : "default"}>
                              {daysUntilDue === 0
                                ? "Due today"
                                : daysUntilDue > 0
                                  ? `Due in ${daysUntilDue} days`
                                  : `Overdue by ${Math.abs(daysUntilDue)} days`}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {borrow.user_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(borrow.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleForceReturn(borrow.id)}>
                          Force Return
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueBooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No overdue books</h3>
                <p className="text-muted-foreground">All books are returned on time</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {overdueBooks.map((borrow) => {
                const daysOverdue = Math.abs(getDaysUntilDue(borrow.due_date))
                return (
                  <Card key={borrow.id} className="border-destructive">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{borrow.book_title}</h3>
                            <Badge variant="destructive">Overdue by {daysOverdue} days</Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {borrow.user_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(borrow.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleForceReturn(borrow.id)}>
                          Force Return
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentReturns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No recent returns</h3>
                <p className="text-muted-foreground">No books have been returned recently</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentReturns.map((borrow) => (
                <Card key={borrow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{borrow.book_title}</h3>
                          <Badge variant="outline">Returned</Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {borrow.user_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Returned: {borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
