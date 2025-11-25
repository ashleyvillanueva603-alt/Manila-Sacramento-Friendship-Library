"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, BookOpen } from "lucide-react"
import { googleBooksService, type GoogleBook } from "@/lib/google-books-api"
import { apiService } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface GoogleBooksSearchProps {
  onBookAdded?: () => void
}

export function GoogleBooksSearch({ onBookAdded }: GoogleBooksSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await googleBooksService.searchBooks(searchQuery, 20)
      setSearchResults(results.items || [])
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search Google Books. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddBook = async (googleBook: GoogleBook, copies = 1) => {
    setIsAdding(googleBook.id)
    try {
      const bookData = googleBooksService.convertToBook(googleBook)

      const newBook = {
        ...bookData,
        total_copies: copies,
        available_copies: copies,
        googleBooksId: googleBook.id,
      }

      console.log("[v0] Adding book from Google Books via API:", newBook)
      const response = await apiService.createBook(newBook)
      console.log("[v0] Book added successfully:", response)

      toast({
        title: "Book Added",
        description: "Book has been successfully added to the library.",
      })

      onBookAdded?.()
    } catch (error) {
      console.error("[v0] Failed to add book from Google Books:", error)
      toast({
        title: "Error",
        description: "Failed to add book to library. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Search books by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((book) => (
              <Card key={book.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex gap-3">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img
                        src={book.volumeInfo.imageLinks.thumbnail || "/placeholder.svg"}
                        alt={book.volumeInfo.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm line-clamp-2">{book.volumeInfo.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                      </CardDescription>
                      {book.volumeInfo.publishedDate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(book.volumeInfo.publishedDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {book.volumeInfo.categories && (
                      <div className="flex flex-wrap gap-1">
                        {book.volumeInfo.categories.slice(0, 2).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {book.volumeInfo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3">{book.volumeInfo.description}</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleAddBook(book)}
                      disabled={isAdding === book.id}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {isAdding === book.id ? "Adding..." : "Add to Library"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No books found for "{searchQuery}"</p>
          <p className="text-sm">Try different search terms or check the spelling.</p>
        </div>
      )}
    </div>
  )
}
