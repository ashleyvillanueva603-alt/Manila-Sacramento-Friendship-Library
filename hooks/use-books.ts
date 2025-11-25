"use client"

import { useState, useEffect } from "react"
import type { Book } from "@/lib/database"
import { apiService } from "@/lib/api-service"

export function useBooks(search = "", genre = "") {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getBooks(search, genre)
      setBooks(response.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch books")
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [search, genre])

  const borrowBook = async (userId: number, bookId: number) => {
    try {
      const response = await apiService.borrowBook(userId, bookId)
      if (response.success) {
        // Refresh books to update available copies
        await fetchBooks()
        return true
      }
      return false
    } catch (error) {
      console.error("Borrow error:", error)
      return false
    }
  }

  const createBook = async (bookData: Partial<Book>) => {
    try {
      const response = await apiService.createBook(bookData)
      if (response.success) {
        await fetchBooks()
        return true
      }
      return false
    } catch (error) {
      console.error("Create book error:", error)
      return false
    }
  }

  const updateBook = async (id: number, bookData: Partial<Book>) => {
    try {
      const response = await apiService.updateBook(id, bookData)
      if (response.success) {
        await fetchBooks()
        return true
      }
      return false
    } catch (error) {
      console.error("Update book error:", error)
      return false
    }
  }

  const deleteBook = async (id: number) => {
    try {
      const response = await apiService.deleteBook(id)
      if (response.success) {
        await fetchBooks()
        return true
      }
      return false
    } catch (error) {
      console.error("Delete book error:", error)
      return false
    }
  }

  return {
    books,
    loading,
    error,
    refetch: fetchBooks,
    borrowBook,
    createBook,
    updateBook,
    deleteBook,
  }
}
