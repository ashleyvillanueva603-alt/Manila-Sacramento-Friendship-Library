"use client"

import { useState, useEffect } from "react"
import type { BookRequest } from "@/lib/database"
import { apiService } from "@/lib/api-service"

interface BookRequestWithUser extends BookRequest {
  user_name?: string
  user_email?: string
}

export function useBookRequests(userId?: number, status?: string) {
  const [requests, setRequests] = useState<BookRequestWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getBookRequests(userId, status)
      setRequests(response.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch book requests")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [userId, status])

  const createRequest = async (requestData: Partial<BookRequest>) => {
    try {
      const response = await apiService.createBookRequest(requestData)
      if (response.success) {
        await fetchRequests()
        return true
      }
      return false
    } catch (error) {
      console.error("Create request error:", error)
      return false
    }
  }

  const updateRequest = async (id: number, status: string, librarianNotes?: string) => {
    try {
      const response = await apiService.updateBookRequest(id, status, librarianNotes)
      if (response.success) {
        await fetchRequests()
        return true
      }
      return false
    } catch (error) {
      console.error("Update request error:", error)
      return false
    }
  }

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
  }
}
