"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { BorrowerLayout } from "@/components/borrower/borrower-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"
import { Search, BookOpen, Calendar, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RecommendationService, type RecommendedBook, type RecommendationContext } from "@/lib/recommendation-service"
import { apiService } from "@/lib/api-service"
import { PendingApprovalBanner } from "@/components/auth/pending-approval-banner"
import { BorrowingService } from "@/lib/borrowing-service"

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBook[]>([])
  const [recommendationContext, setRecommendationContext] = useState<RecommendationContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [genres, setGenres] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [borrowingLoading, setBorrowingLoading] = useState<number | null>(null)
  const [reservingLoading, setReservingLoading] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const booksPerPage = 50
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    const refreshUserStatus = async () => {
      if (user) {
        console.log("[v0] Refreshing user approval status on books page load")
        await refreshUser()
      }
    }
    refreshUserStatus()
  }, [])

  const loadBooks = async (page = 1) => {
    try {
      setError(null)
      setLoading(true)
      console.log("[v0] Loading books from API...")

      const offset = (page - 1) * booksPerPage
      const response = await apiService.getBooks(
        searchTerm,
        selectedGenre === "all" ? "" : selectedGenre,
        booksPerPage,
        offset,
      )
      console.log("[v0] Books API response:", response)

      let allBooks: Book[] = []

      if (response.records && Array.isArray(response.records)) {
        allBooks = response.records
      } else if (response.books && Array.isArray(response.books)) {
        allBooks = response.books
      } else if (Array.isArray(response)) {
        allBooks = response
      } else {
        console.error("[v0] Unexpected response format:", response)
        throw new Error("Unexpected API response format")
      }

      const total = response.total || allBooks.length
      console.log("[v0] Loaded books count:", allBooks.length, "Total:", total)

      setBooks(allBooks)
      setTotalBooks(total)
      setCurrentPage(page)

      if (page === 1) {
        const uniqueGenres = [...new Set(allBooks.map((book: Book) => book.genre).filter(Boolean))]
        setGenres(uniqueGenres)
      }
    } catch (error) {
      console.error("[v0] Error loading books:", error)
      setError( 
        `Failed to load books: ${error instanceof Error ? error.message : "Unknown error"}. Please refresh the page to try again.`,
      )
      setBooks([])
      setTotalBooks(0)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    if (!user) return
    try {
      const recommendations = await RecommendationService.getRecommendations(user.id, 6)
      const context = await RecommendationService.getUserGenrePreferences(user.id)
      setRecommendedBooks(recommendations)
      setRecommendationContext(context)
    } catch (error) {
      console.error("Error loading recommendations:", error)
    }
  }

  useEffect(() => {
    loadBooks(1)
    loadRecommendations()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedGenre])

  const handleBorrowBook = async (bookId: number) => {
    if (!user) return

    if (user.role === "student" && user.approved !== true) {
      alert("Your account is pending approval. You'll be able to borrow books once a librarian approves your account.")
      return
    }

    setBorrowingLoading(bookId)
    try {
      console.log("[v0] Requesting to borrow book via API:", bookId)
      const result = await apiService.borrowBook(user.id, bookId)
      console.log("[v0] Borrow request result:", result)

      alert(result.message || "Borrow request submitted! Waiting for librarian approval.")

      if (result.success) {
        await loadBooks(currentPage)
        await loadRecommendations()
      }
    } catch (error) {
      console.error("Error borrowing book:", error)
      alert("Failed to submit borrow request. Please try again.")
    } finally {
      setBorrowingLoading(null)
    }
  }

  const handleReserveBook = async (bookId: number) => {
    if (!user) return

    if (user.role === "student" && user.approved !== true) {
      alert("Your account is pending approval. You'll be able to reserve books once a librarian approves your account.")
      return
    }

    setReservingLoading(bookId)
    try {
      console.log("[v0] Requesting to reserve book via API:", bookId)
      const result = await BorrowingService.reserveBook(user.id, bookId)
      console.log("[v0] Reserve request result:", result)

      alert(result.message || "Book reserved successfully! You'll be notified when it becomes available.")

      if (result.success) {
        await loadBooks(currentPage)
        await loadRecommendations()
      }
    } catch (error) {
      console.error("Error reserving book:", error)
      alert("Failed to reserve book. Please try again.")
    } finally {
      setReservingLoading(null)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalBooks / booksPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const generateRecommendationDescription = (): string => {
    if (!recommendationContext || recommendationContext.topGenres.length === 0) {
      return "These recommendations are based on popular books in our collection that match your interests."
    }

    const topGenre = recommendationContext.topGenres[0]
    const secondaryGenre = recommendationContext.topGenres[1]

    if (secondaryGenre) {
      return `These recommendations are based on your recent interest in ${topGenre} books. Other students who borrowed ${topGenre} titles also enjoyed books from the ${secondaryGenre} genre — that's why we think you might like these too!`
    }

    return `These recommendations are based on your recent interest in ${topGenre} books. We've selected titles that match your reading preferences and are enjoyed by readers with similar interests.`
  }

  const totalPages = Math.ceil(totalBooks / booksPerPage)
  const startIndex = (currentPage - 1) * booksPerPage + 1
  const endIndex = Math.min(currentPage * booksPerPage, totalBooks)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      </div>
    )
  }

  const showApprovalBanner = user?.role === "student" && user.approved !== true

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Books</h1>
        <p className="text-muted-foreground">Discover and borrow books from our collection</p>
      </div>

      {showApprovalBanner && <PendingApprovalBanner />}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendedBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">{generateRecommendationDescription()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedBooks.map((book) => (
              <Card
                key={book.id}
                className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-primary/20 flex flex-col"
              >
                {book.coverUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg bg-muted relative flex-shrink-0">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-xs text-white font-semibold">Book Cover</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {book.publishedYear}
                    </div>
                  </div>

                  <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                    {book.recommendationReason}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{book.available_copies}</span>
                      <span className="text-muted-foreground"> available</span>
                    </div>
                    <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                      {book.available_copies > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>

                  {book.available_copies > 0 ? (
                    <Button
                      className="w-full"
                      disabled={borrowingLoading === book.id}
                      onClick={() => handleBorrowBook(book.id!)}
                    >
                      {borrowingLoading === book.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Borrowing...
                        </>
                      ) : (
                        "Borrow Book"
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={reservingLoading === book.id}
                      onClick={() => handleReserveBook(book.id!)}
                    >
                      {reservingLoading === book.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Reserving...
                        </>
                      ) : (
                        "Reserve"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recommendedBooks.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">All Books</h2>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {totalBooks > 0 ? `Showing ${startIndex}–${endIndex} of ${totalBooks} books` : "No books found"}
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No books found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedGenre !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No books available in the collection"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col"
              >
                {book.coverUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg bg-muted relative flex-shrink-0">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-xs text-white font-semibold">Book Cover</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {book.publishedYear}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{book.available_copies}</span>
                      <span className="text-muted-foreground"> available</span>
                    </div>
                    <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                      {book.available_copies > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>

                  {book.available_copies > 0 ? (
                    <Button
                      className="w-full"
                      disabled={borrowingLoading === book.id}
                      onClick={() => handleBorrowBook(book.id!)}
                    >
                      {borrowingLoading === book.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Borrowing...
                        </>
                      ) : (
                        "Borrow Book"
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={reservingLoading === book.id}
                      onClick={() => handleReserveBook(book.id!)}
                    >
                      {reservingLoading === book.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Reserving...
                        </>
                      ) : (
                        "Reserve"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <Button variant="outline" onClick={handleNextPage} disabled={currentPage >= totalPages}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <BorrowerLayout>
        <BooksPage />
      </BorrowerLayout>
    </AuthGuard>
  )
}
