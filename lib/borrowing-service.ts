import { apiService } from "./api-service"

export class BorrowingService {
  static async borrowBook(userId: number, bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] BorrowingService: calling API to borrow book")
      const response = await apiService.borrowBook(userId, bookId)
      console.log("[v0] BorrowingService: API response:", response)

      return {
        success: response.success || false,
        message: response.message || "Book borrowed successfully!",
      }
    } catch (error) {
      console.error("Error borrowing book:", error)
      return { success: false, message: "Failed to borrow book. Please try again." }
    }
  }

  static async returnBook(borrowId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] BorrowingService: calling API to return book")
      const response = await apiService.returnBook(borrowId)
      console.log("[v0] BorrowingService: API response:", response)

      return {
        success: response.success || false,
        message: response.message || "Book returned successfully!",
      }
    } catch (error) {
      console.error("Error returning book:", error)
      return { success: false, message: "Failed to return book. Please try again." }
    }
  }

  static async renewBook(borrowId: number): Promise<{ success: boolean; message: string }> {
    try {
      const borrowRecord = await apiService.getBorrowRecord(borrowId)
      if (!borrowRecord) {
        return { success: false, message: "Borrow record not found" }
      }

      if (borrowRecord.status !== "borrowed") {
        return { success: false, message: "Can only renew active borrows" }
      }

      const now = new Date()
      const dueDate = new Date(borrowRecord.dueDate)
      if (now > dueDate) {
        return { success: false, message: "Cannot renew overdue books. Please return first." }
      }

      const newDueDate = new Date(dueDate)
      newDueDate.setDate(newDueDate.getDate() + 14)

      await apiService.updateBorrowRecord(borrowId, {
        dueDate: newDueDate.toISOString(),
      })

      return { success: true, message: "Book renewed successfully! New due date: " + newDueDate.toLocaleDateString() }
    } catch (error) {
      console.error("Error renewing book:", error)
      return { success: false, message: "Failed to renew book. Please try again." }
    }
  }

  static async reserveBook(userId: number, bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] BorrowingService: calling API to reserve book")
      const response = await apiService.reserveBook(userId, bookId)
      console.log("[v0] BorrowingService: API response:", response)

      return {
        success: response.success || false,
        message: response.message || "Book reserved successfully!",
      }
    } catch (error) {
      console.error("Error reserving book:", error)
      return { success: false, message: "Failed to reserve book. Please try again." }
    }
  }

  static async updateOverdueBooks(): Promise<void> {
    try {
      const now = new Date()
      const activeBorrows = await apiService.getActiveBorrowRecords()

      for (const borrow of activeBorrows) {
        const dueDate = new Date(borrow.dueDate)
        if (now > dueDate && borrow.id) {
          await apiService.updateBorrowRecord(borrow.id, {
            status: "overdue",
          })
        }
      }
    } catch (error) {
      console.error("Error updating overdue books:", error)
    }
  }

  static async getUserBorrowingStats(userId: number) {
    try {
      const records = await apiService.getUserBorrowRecords(userId)

      const currentBorrows = records.filter((r) => r.status === "borrowed").length
      const totalBorrows = records.length
      const overdueBooks = records.filter((r) => r.status === "overdue").length

      return {
        currentBorrows,
        totalBorrows,
        overdueBooks,
        borrowingLimit: 5,
        availableSlots: 5 - currentBorrows,
      }
    } catch (error) {
      console.error("Error getting user borrowing stats:", error)
      return {
        currentBorrows: 0,
        totalBorrows: 0,
        overdueBooks: 0,
        borrowingLimit: 5,
        availableSlots: 5,
      }
    }
  }
}
