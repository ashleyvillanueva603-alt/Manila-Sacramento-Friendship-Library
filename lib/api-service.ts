import type { User, Book } from "./database"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gray-skunk-937601.hostingersite.com/api"

class ApiService {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log("[v0] API request:", url, options.method || "GET")
      const response = await fetch(url, config)

      const contentType = response.headers.get("content-type")
      const text = await response.text()

      console.log("[v0] API response status:", response.status)
      console.log("[v0] API response text:", text.substring(0, 200))

      // If response is empty, return a default success response
      if (!text || text.trim() === "") {
        if (response.ok) {
          return { success: true, message: "Operation completed successfully" }
        } else {
          throw new Error(`API request failed with status ${response.status}`)
        }
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] Failed to parse JSON:", text)
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(data.message || `API request failed with status ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("[v0] API request error:", error)
      throw error
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: Partial<User>) {
    console.log("[v0] Registering user with data:", userData)
    try {
      const formattedData = {
        ...userData,
        // Ensure boolean fields are sent correctly
        approved: false,
        is_active: true,
        // Ensure date fields are formatted correctly
        birth_date: userData.birthDate || userData.birthDate,
        // Ensure numeric fields are numbers
        age: userData.age ? Number(userData.age) : undefined,
      }

      console.log("[v0] Formatted registration data:", formattedData)

      const response = await this.request("/auth/register.php", {
        method: "POST",
        body: JSON.stringify(formattedData),
      })
      console.log("[v0] Registration API response:", response)
      return response
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      throw new Error(error.message || "Registration failed")
    }
  }

  // Book methods
  async getBooks(search = "", genre = "", limit = 50, offset = 0) {
    const params = new URLSearchParams({
      search,
      genre,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    try {
      const response = await this.request(`/books/read.php?${params}`)
      console.log("[v0] getBooks response:", response)
      console.log("[v0] getBooks total field:", response.total, "type:", typeof response.total)

      const transformedRecords = (response.records || []).map((book: any) => ({
        ...book,
        coverUrl: book.cover_url,
        accessionNumber: book.accession_number,
        publishedYear: book.published_year,
        availableCopies: book.available_copies,
        totalCopies: book.total_copies,
        googleBooksId: book.google_books_id,
      }))

      const total = typeof response.total === "number" ? response.total : transformedRecords.length || 0
      console.log("[v0] getBooks computed total:", total)
      return {
        ...response,
        records: transformedRecords,
        total: total,
      }
    } catch (error: any) {
      // If the error is "No books found", return empty records instead of throwing
      if (error.message === "No books found") {
        console.log("[v0] No books found, returning empty array")
        return { success: true, records: [], total: 0, message: "No books found" }
      }
      throw error
    }
  }

  async getBook(id: number) {
    return this.request(`/books/read.php?id=${id}`)
  }

  async createBook(bookData: Partial<Book>) {
    const formattedData = {
      ...bookData,
      accession_number: bookData.accessionNumber,
      cover_url: bookData.coverUrl,
    }

    return this.request("/books/create.php", {
      method: "POST",
      body: JSON.stringify(formattedData),
    })
  }

  async updateBook(id: number, bookData: Partial<Book>) {
    const formattedData = {
      id,
      ...bookData,
      accession_number: bookData.accessionNumber,
      cover_url: bookData.coverUrl,
    }

    return this.request("/books/update.php", {
      method: "PUT",
      body: JSON.stringify(formattedData),
    })
  }

  async deleteBook(id: number) {
    return this.request("/books/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    })
  }

  // Borrow methods
  async borrowBook(userId: number, bookId: number) {
    const today = new Date().toISOString().split("T")[0]
    return this.request("/borrow/create.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        borrow_date: today,
        return_date: today, // Same day return
        due_date: today, // No future due date
        status: "pending", // Requires librarian approval
      }),
    })
  }

  async returnBook(borrowId: number) {
    console.log("FUCK THIS SHIT: >>>>>>>>>>", borrowId)
    return this.request("/borrow/return.php", {
      method: "POST",
      body: JSON.stringify({
        id: borrowId,
        borrow_id: borrowId,
        record_id: borrowId,
      }),
    })
  }

  async getBorrowHistory(userId?: number, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (userId) {
      params.append("user_id", userId.toString())
    }

    try {
      const response = await this.request(`/borrow/history.php?${params}`)
      console.log("[v0] getBorrowHistory raw response:", JSON.stringify(response, null, 2))

      // If response has records directly, wrap it in success format
      if (response.records && !response.success) {
        return { success: true, records: response.records }
      }

      return response
    } catch (error) {
      console.error("[v0] Error in getBorrowHistory:", error)
      return { success: false, records: [] }
    }
  }

  async getPendingBorrows(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    try {
      // Try the pending endpoint first
      const url = `${API_BASE_URL}/borrow/pending.php?${params}`
      console.log("[v0] API request:", url, "GET")

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] API response status:", response.status)

      // If the endpoint returns 500 or fails, immediately use fallback
      if (!response.ok) {
        console.log("[v0] Pending endpoint unavailable, using history fallback")
        throw new Error("Pending endpoint unavailable")
      }

      const text = await response.text()
      console.log("[v0] API response text:", text.substring(0, 200))

      if (!text || text.trim() === "") {
        console.log("[v0] Empty response, using history fallback")
        throw new Error("Empty response")
      }

      const data = JSON.parse(text)
      console.log("[v0] getPendingBorrows response:", data)

      if (data.records) {
        return { success: true, records: data.records }
      }
      return data
    } catch (error) {
      console.log("[v0] Using history fallback for pending borrows")

      // Fallback: get all history and filter for pending status
      try {
        const historyResponse = await this.getBorrowHistory(undefined, limit, offset)
        const pendingRecords =
          historyResponse.records?.filter(
            (record: any) => (record.status === "pending" || record.status === "") && !record.return_date,
          ) || []

        console.log("[v0] Loaded pending requests via fallback:", pendingRecords.length)
        console.log("[v0] Pending records details:", JSON.stringify(pendingRecords, null, 2))
        return { success: true, records: pendingRecords }
      } catch (fallbackError) {
        console.error("[v0] Fallback also failed:", fallbackError)
        return { success: false, records: [] }
      }
    }
  }

  async approveBorrow(borrowId: number, librarianId: number) {
    return this.request("/borrow/approve.php", {
      method: "POST",
      body: JSON.stringify({
        borrow_id: borrowId,
        librarian_id: librarianId,
        action: "approve",
      }),
    })
  }

  async rejectBorrow(borrowId: number, librarianId: number, reason: string) {
    return this.request("/borrow/approve.php", {
      method: "POST",
      body: JSON.stringify({
        borrow_id: borrowId,
        librarian_id: librarianId,
        action: "reject",
        reason: reason,
      }),
    })
  }

  // User methods
  async getUsers(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    try {
      const response = await this.request(`/users/read.php?${params}`)
      console.log("[v0] getUsers raw response:", response)

      // If response has records directly, wrap it in success format
      if (response.records && !response.success) {
        return { success: true, records: response.records }
      }

      return response
    } catch (error) {
      console.error("[v0] Error in getUsers:", error)
      return { success: false, records: [] }
    }
  }

  async getUser(id: number) {
    return this.request(`/users/read.php?id=${id}`)
  }

  async getCurrentUserData(userId: number) {
    try {
      const response = await this.request(`/users/read.php?id=${userId}`)
      console.log("[v0] getCurrentUserData response:", response)
      return response
    } catch (error) {
      console.error("[v0] Error fetching current user data:", error)
      return null
    }
  }

  async updateUser(id: number, userData: Partial<User>) {
    return this.request("/users/update.php", {
      method: "PUT",
      body: JSON.stringify({ id, ...userData }),
    })
  }

  async deleteUser(id: number) {
    return this.request("/users/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    })
  }

  async getDashboardStats() {
    return this.request("/analytics/overall-stats.php")
  }

  async getAnalytics(timeRange: "3m" | "6m" | "1y" = "6m") {
    const days = timeRange === "3m" ? 90 : timeRange === "6m" ? 180 : 365
    return this.request(`/analytics/time-series.php?days=${days}`)
  }

  async getCategoryPerformance() {
    return this.request("/analytics/category-performance.php")
  }

  async getBookUsage() {
    return this.request("/analytics/book-usage.php")
  }

  async getBorrowerInsights() {
    return this.request("/analytics/borrower-insights.php")
  }

  async getNextStudentId() {
    return this.request("/users/student_id.php")
  }

  // Fines management methods
  async getFines(userId?: number, status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (userId) {
      params.append("user_id", userId.toString())
    }

    if (status) {
      params.append("status", status)
    }

    return this.request(`/fines/read.php?${params}`)
  }

  async updateFineStatus(fineId: number, status: "paid" | "waived", paymentMethod?: string) {
    return this.request("/fines/update.php", {
      method: "PUT",
      body: JSON.stringify({
        id: fineId,
        status,
        payment_method: paymentMethod,
        paid_date: new Date().toISOString(),
      }),
    })
  }

  async createFine(fineData: {
    userId: number
    borrowRecordId: number
    amount: number
    reason: string
  }) {
    return this.request("/fines/create.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: fineData.userId,
        borrow_record_id: fineData.borrowRecordId,
        amount: fineData.amount,
        reason: fineData.reason,
      }),
    })
  }

  // Book request methods
  async getBookRequests(userId?: number, status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (userId) {
      params.append("user_id", userId.toString())
    }

    if (status) {
      params.append("status", status)
    }

    return this.request(`/requests/read.php?${params}`)
  }

  async createBookRequest(requestData: {
    user_id: number
    book_title: string
    author?: string
    isbn?: string
    reason: string
  }) {
    return this.request("/requests/create.php", {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  }

  async updateBookRequest(id: number, status: string, librarianNotes?: string) {
    return this.request("/requests/update.php", {
      method: "POST",
      body: JSON.stringify({
        id,
        status,
        librarian_notes: librarianNotes,
      }),
    })
  }

  // Reservation methods for unavailable books
  async reserveBook(userId: number, bookId: number) {
    return this.request("/reservations/create.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
      }),
    })
  }

  async getReservations(userId?: number, status = "active", limit = 50, offset = 0) {
    const params = new URLSearchParams({
      status,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (userId) {
      params.append("user_id", userId.toString())
    }

    return this.request(`/reservations/read.php?${params}`)
  }

  async cancelReservation(userId: number, bookId: number) {
    return this.request("/reservations/cancel.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
      }),
    })
  }

  // New reservation fulfillment methods
  async getFullfilledReservations(userId?: number, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (userId) {
      params.append("user_id", userId.toString())
    }

    return this.request(`/reservations/fulfilled.php?${params}`)
  }

  async approveReservation(userId: number, bookId: number, librarianId: number) {
    return this.request("/reservations/approve.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        librarian_id: librarianId,
      }),
    })
  }

  async rejectReservation(userId: number, bookId: number, librarianId: number, reason: string) {
    return this.request("/reservations/reject.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        librarian_id: librarianId,
        reason,
      }),
    })
  }

  // Method to get next accession number
  async getNextAccessionNumber() {
    return this.request("/books/next-accession.php")
  }

  async fulfillReservation(reservationId: number) {
    return this.request("/reservations/fulfill.php", {
      method: "POST",
      body: JSON.stringify({
        reservation_id: reservationId,
      }),
    })
  }

  async bulkApproveUsers(userIds: number[], librarianId: number) {
    return this.request("/users/bulk-approve.php", {
      method: "POST",
      body: JSON.stringify({
        user_ids: userIds,
        librarian_id: librarianId,
        action: "approve",
      }),
    })
  }

  // Removed problematic methods that use non-existent endpoints
}

export const apiService = new ApiService()
export default apiService
