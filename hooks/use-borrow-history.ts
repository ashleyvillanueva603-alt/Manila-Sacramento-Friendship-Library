"use client"

import { useState, useEffect } from "react"
import type { BorrowRecord } from "@/lib/database"
import { apiService } from "@/lib/api-service"

interface BorrowHistoryRecord extends BorrowRecord {
  book_title: string
  book_author: string
  book_cover: string
  user_name?: string
}

export function useBorrowHistory(userId?: number) {
  const [history, setHistory] = useState<BorrowHistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getBorrowHistory(userId)
      setHistory(response.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch borrow history")
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const returnBook = async (borrowId: number) => {
    try {
      const response = await apiService.returnBook(borrowId)
      if (response.success) {
        await fetchHistory()
        return true
      }
      return false
    } catch (error) {
      console.error("Return book error:", error)
      return false
    }
  }

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    returnBook,
  }
}
