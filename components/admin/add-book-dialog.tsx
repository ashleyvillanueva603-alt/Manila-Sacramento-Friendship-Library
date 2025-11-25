"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api-service"
import { Plus, Search, BookOpen, RefreshCw } from "lucide-react"
import { GoogleBooksSearch } from "./google-books-search"

interface AddBookDialogProps {
  onBookAdded?: () => void
}

export function AddBookDialog({ onBookAdded }: AddBookDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    accessionNumber: "",
    genre: "",
    description: "",
    publishedYear: new Date().getFullYear(),
    total_copies: 1,
    publisher: "",
    pageCount: 0,
    language: "English",
    coverUrl: "",
  })

  useEffect(() => {
    if (open) {
      loadNextAccessionNumber()
    }
  }, [open])

  const loadNextAccessionNumber = async () => {
    try {
      console.log("[v0] Loading next accession number...")
      const response = await apiService.getNextAccessionNumber()
      console.log("[v0] Next accession number response:", response)

      if (response.success && response.next_accession_number) {
        setFormData((prev) => ({ ...prev, accessionNumber: response.next_accession_number }))
      }
    } catch (error) {
      console.error("[v0] Failed to load next accession number:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        accessionNumber: formData.accessionNumber,
        genre: formData.genre,
        description: formData.description,
        publishedYear: formData.publishedYear,
        total_copies: formData.total_copies,
        available_copies: formData.total_copies,
        publisher: formData.publisher,
        pageCount: formData.pageCount,
        language: formData.language,
        coverUrl: formData.coverUrl,
        categories: formData.genre ? [formData.genre] : [],
      }

      console.log("[v0] Creating book via API:", bookData)
      const response = await apiService.createBook(bookData)
      console.log("[v0] Book created successfully:", response)

      onBookAdded?.()
      setOpen(false)
      setFormData({
        title: "",
        author: "",
        isbn: "",
        accessionNumber: "",
        genre: "",
        description: "",
        publishedYear: new Date().getFullYear(),
        total_copies: 1,
        publisher: "",
        pageCount: 0,
        language: "English",
        coverUrl: "",
      })
    } catch (err) {
      console.error("[v0] Failed to add book:", err)
      setError("Failed to add book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGoogleBookAdded = () => {
    onBookAdded?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a new book to the library collection manually or search from Google Books.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Google Books
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-4">
            <GoogleBooksSearch onBookAdded={handleGoogleBookAdded} />
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Book title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="Author name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange("isbn", e.target.value)}
                    placeholder="978-0-123456-78-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessionNumber">Accession Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accessionNumber"
                      value={formData.accessionNumber}
                      onChange={(e) => handleInputChange("accessionNumber", e.target.value)}
                      placeholder="Auto-generated"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={loadNextAccessionNumber}
                      title="Regenerate accession number"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-generated unique identifier for this book copy</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                    placeholder="Fiction, Science, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange("publisher", e.target.value)}
                    placeholder="Publisher name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    placeholder="English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishedYear">Published Year</Label>
                  <Input
                    id="publishedYear"
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => handleInputChange("publishedYear", Number.parseInt(e.target.value))}
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageCount">Page Count</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => handleInputChange("pageCount", Number.parseInt(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_copies">Total Copies</Label>
                  <Input
                    id="total_copies"
                    type="number"
                    value={formData.total_copies}
                    onChange={(e) => handleInputChange("total_copies", Number.parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => handleInputChange("coverUrl", e.target.value)}
                  placeholder="https://example.com/book-cover.jpg"
                />
                <p className="text-xs text-muted-foreground">Direct URL to the book cover image</p>
                {formData.coverUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.coverUrl || "/placeholder.svg"}
                      alt="Book cover preview"
                      className="w-32 h-48 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=192&width=128"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the book"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Book"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
