"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Book } from "@/lib/database"
import { Edit } from "lucide-react"

interface EditBookDialogProps {
  book: Book
  onBookUpdated?: () => void
}

export function EditBookDialog({ book, onBookUpdated }: EditBookDialogProps) {
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

  // Initialize form data when book changes or dialog opens
  useEffect(() => {
    if (book && open) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        accessionNumber: (book as any).accessionNumber || (book as any).accession_number || "",
        genre: book.genre || "",
        description: book.description || "",
        publishedYear: book.publishedYear || new Date().getFullYear(),
        total_copies: book.total_copies || 1,
        publisher: book.publisher || "",
        pageCount: book.pageCount || 0,
        language: book.language || "English",
        coverUrl: book.coverUrl || (book as any).cover_url || "",
      })
    }
  }, [book, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Calculate available copies based on the change in total copies
      const copyDifference = formData.total_copies - book.total_copies
      const newAvailableCopies = Math.max(0, book.available_copies + copyDifference)

      const updatedBook = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        accessionNumber: formData.accessionNumber,
        genre: formData.genre,
        description: formData.description,
        publishedYear: formData.publishedYear,
        total_copies: formData.total_copies,
        available_copies: newAvailableCopies,
        publisher: formData.publisher,
        pageCount: formData.pageCount,
        language: formData.language,
        coverUrl: formData.coverUrl,
        categories: formData.genre ? [formData.genre] : [],
      }

      console.log("[v0] Updating book via API:", book.id, updatedBook)
      const response = await apiService.updateBook(book.id!, updatedBook)
      console.log("[v0] Book updated successfully:", response)

      onBookUpdated?.()
      setOpen(false)
    } catch (err) {
      console.error("[v0] Failed to update book:", err)
      setError("Failed to update book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update the book information in the library collection.</DialogDescription>
        </DialogHeader>

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
              <Input
                id="accessionNumber"
                value={formData.accessionNumber}
                onChange={(e) => handleInputChange("accessionNumber", e.target.value)}
                placeholder="ACC-2024-001"
              />
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
            {formData.coverUrl && (
              <div className="mt-2">
                <img
                  src={formData.coverUrl || "/placeholder.svg"}
                  alt="Book cover preview"
                  className="w-32 h-48 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
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
              {loading ? "Updating..." : "Update Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
