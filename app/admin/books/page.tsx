"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AddBookDialog } from "@/components/admin/add-book-dialog"
import { EditBookDialog } from "@/components/admin/edit-book-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api-service"
import type { Book } from "@/lib/database"
import { Search, Trash2, BookOpen } from "lucide-react"
import { PaginationControls } from "@/components/admin/pagination-controls"
import { BookCopiesModal } from "@/components/admin/book-copies-modal"

function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const booksPerPage = 10

  const loadBooks = async (page = 1) => {
    try {
      setLoading(true)
      console.log("[v0] Loading books from API...")
      const offset = (page - 1) * booksPerPage
      const response = await apiService.getBooks(searchTerm, "", booksPerPage, offset)
      console.log("[v0] API response:", response)

      const allBooks = response.records || []
      const total =
        typeof response.total === "number" && response.total > 0
          ? response.total
          : allBooks.length === booksPerPage
            ? page * booksPerPage + 1
            : (page - 1) * booksPerPage + allBooks.length

      console.log("[v0] Loaded books count:", allBooks.length, "Total:", total)

      const uniqueBooks = Array.from(new Map(allBooks.map((book) => [book.title.trim().toLowerCase(), book])).values())

      setBooks(uniqueBooks)
      setTotalBooks(total)
      setCurrentPage(page)
    } catch (error) {
      console.error("[v0] Error loading books:", error)
      setBooks([])
      setTotalBooks(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks(1)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleDeleteBook = async (bookId: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        console.log("[v0] Deleting book:", bookId)
        await apiService.deleteBook(bookId)
        loadBooks(currentPage)
      } catch (error) {
        console.error("[v0] Error deleting book:", error)
      }
    }
  }

  const handleNextPage = () => {
    if (books.length === booksPerPage) {
      loadBooks(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadBooks(currentPage - 1)
    }
  }

  const totalPages = Math.ceil(totalBooks / booksPerPage)
  const startIndex = (currentPage - 1) * booksPerPage + 1
  const endIndex = Math.min(currentPage * booksPerPage, totalBooks)

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
          <h1 className="text-3xl font-bold">Book Management</h1>
          <p className="text-muted-foreground">Manage your library's book collection</p>
        </div>
        <AddBookDialog onBookAdded={() => loadBooks(currentPage)} />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {totalBooks > 0
            ? `Showing ${startIndex}–${endIndex} of ${totalBooks}${books.length === booksPerPage ? "+" : ""} books`
            : "No books found"}
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No books found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first book to the collection"}
            </p>
            {!searchTerm && <AddBookDialog onBookAdded={() => loadBooks(currentPage)} />}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedBook(book)
                  setIsModalOpen(true)
                }}
              >
                {book.coverUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg bg-muted relative">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">Book Cover</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="mt-1">by {book.author}</CardDescription>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <EditBookDialog book={book} onBookUpdated={() => loadBooks(currentPage)} />
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBook(book.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <span className="text-sm text-muted-foreground">{book.publishedYear}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>

                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {book.totalCopies} {book.totalCopies === 1 ? "copy" : "copies"} available
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{book.available_copies}</span>
                      <span className="text-muted-foreground"> / {book.totalCopies} available</span>
                    </div>
                    <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                      {book.available_copies > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={loadBooks}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalBooks}
            hasMore={books.length === booksPerPage}
          />
        </>
      )}

      <BookCopiesModal book={selectedBook} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <AdminBooksPage />
      </AdminLayout>
    </AuthGuard>
  )
}
