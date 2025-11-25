"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { BorrowerLayout } from "@/components/borrower/borrower-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen, Calendar } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface BorrowedBookWithDetails {
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

function MyBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookWithDetails[]>([])
  const [borrowHistory, setBorrowHistory] = useState<BorrowedBookWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const loadUserBooks = async () => {
    if (!user) return

    try {
      console.log("[v0] Loading borrow history from API for user:", user.id)
      const response = await apiService.getBorrowHistory(user.id)
      console.log("[v0] Borrow history response:", response)

      const allBorrows: BorrowedBookWithDetails[] = response.records || []
      console.log("[v0] Total borrow records:", allBorrows.length)
      allBorrows.forEach((record, index) => {
        console.log(`[v0] Record ${index + 1}:`, JSON.stringify(record, null, 2))
      })

      // Current borrows: unreturned books (status empty or borrowed/approved)
      const current = allBorrows.filter((borrow) => !borrow.return_date)
      // History: returned books
      const history = allBorrows.filter((borrow) => borrow.return_date !== null)

      console.log("[v0] Current borrows:", current.length, "History:", history.length)
      console.log("[v0] Current borrow details:", JSON.stringify(current, null, 2))

      setBorrowedBooks(current)
      setBorrowHistory(history)
    } catch (error) {
      console.error("[v0] Error loading user books:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserBooks()
  }, [user])

  const handleReturnBook = async (borrowId: number) => {
    try {
      console.log("[v0] Returning book:", borrowId)
      const result = await apiService.returnBook(borrowId)
      alert(result.message || "Book returned successfully")
      loadUserBooks()
    } catch (error: any) {
      console.error("[v0] Error returning book:", error)
      alert(error.message || "Failed to return book")
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate)
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
      <div>
        <h1 className="text-3xl font-bold">My Books</h1>
        <p className="text-muted-foreground">Manage your borrowed books and view your reading history</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Borrows ({borrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="history">History ({borrowHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {borrowedBooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No books currently borrowed</h3>
                <p className="text-muted-foreground text-center mb-4">Browse our collection to find books to borrow</p>
                <Button asChild>
                  <a href="/books">Browse Books</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {borrowedBooks.map((borrow) => {
                const daysUntilDue = getDaysUntilDue(borrow.due_date)
                const overdue = isOverdue(borrow.due_date)

                return (
                  <Card key={borrow.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{borrow.book_title}</CardTitle>
                      <CardDescription>by {borrow.book_author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={overdue ? "destructive" : daysUntilDue <= 3 ? "secondary" : "default"}>
                          {overdue
                            ? `Overdue by ${Math.abs(daysUntilDue)} days`
                            : daysUntilDue === 0
                              ? "Due today"
                              : `Due in ${daysUntilDue} days`}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {new Date(borrow.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReturnBook(borrow.id)} className="w-full">
                          Return Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {borrowHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reading history</h3>
                <p className="text-muted-foreground text-center">Your returned books will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {borrowHistory.map((borrow) => (
                <Card key={borrow.id}>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{borrow.book_title}</CardTitle>
                    <CardDescription>by {borrow.book_author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</p>
                      <p>Returned: {borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : "N/A"}</p>
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

export default function Page() {
  return (
    <AuthGuard>
      <BorrowerLayout>
        <MyBooksPage />
      </BorrowerLayout>
    </AuthGuard>
  )
}
