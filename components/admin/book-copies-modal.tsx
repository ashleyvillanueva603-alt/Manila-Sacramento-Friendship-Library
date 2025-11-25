"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/database"

interface BookCopiesModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

export function BookCopiesModal({ book, isOpen, onClose }: BookCopiesModalProps) {
  if (!book) return null

  const copies = Array.from({ length: book.totalCopies || 1 }, (_, index) => ({
    copyNumber: index + 1,
    totalCopies: book.totalCopies || 1,
    accessionNumber: (book as any).accessionNumber ? `${(book as any).accessionNumber}` : "Accession: pending",
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <DialogDescription>by {book.author}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Details */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Genre</p>
              <Badge variant="secondary">{book.genre}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published Year</p>
              <p className="font-medium">{book.publishedYear || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{book.description || "No description available"}</p>
            </div>
          </div>

          {/* Copies Section */}
          <div>
            <h3 className="font-semibold mb-3">All Copies ({book.totalCopies})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {copies.map((copy) => (
                <div
                  key={`copy-${copy.copyNumber}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Copy {copy.copyNumber} of {copy.totalCopies}
                    </p>
                    <p className="text-xs text-muted-foreground">{copy.accessionNumber}</p>
                  </div>
                  <Badge variant={copy.copyNumber <= book.available_copies ? "default" : "destructive"}>
                    {copy.copyNumber <= book.available_copies ? "Available" : "Borrowed"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Copies</p>
              <p className="text-2xl font-bold">{book.totalCopies}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">{book.available_copies}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
