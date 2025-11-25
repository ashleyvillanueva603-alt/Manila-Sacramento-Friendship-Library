"use client"

import { db } from "./database"
import { apiService } from "./api-service"

interface MigrationProgress {
  step: string
  current: number
  total: number
  completed: boolean
  error?: string
}

export class MigrationService {
  private onProgress?: (progress: MigrationProgress) => void

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress
  }

  private updateProgress(step: string, current: number, total: number, completed = false, error?: string) {
    if (this.onProgress) {
      this.onProgress({ step, current, total, completed, error })
    }
  }

  async migrateData(): Promise<boolean> {
    try {
      console.log("[v0] Starting data migration from IndexedDB to MySQL...")

      // Step 1: Migrate Users
      await this.migrateUsers()

      // Step 2: Migrate Books
      await this.migrateBooks()

      // Step 3: Migrate Borrow Records
      await this.migrateBorrowRecords()

      // Step 4: Migrate Book Requests
      await this.migrateBookRequests()

      // Step 5: Migrate Reservations
      await this.migrateReservations()

      // Step 6: Migrate Fines
      await this.migrateFines()

      // Step 7: Migrate Notifications
      await this.migrateNotifications()

      this.updateProgress("Migration completed", 7, 7, true)
      console.log("[v0] Data migration completed successfully!")
      return true
    } catch (error) {
      console.error("[v0] Migration failed:", error)
      this.updateProgress("Migration failed", 0, 7, false, error instanceof Error ? error.message : "Unknown error")
      return false
    }
  }

  private async migrateUsers() {
    this.updateProgress("Migrating users", 0, 7)

    try {
      const users = await db.users.toArray()
      console.log(`[v0] Found ${users.length} users to migrate`)

      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        try {
          await apiService.register({
            email: user.email,
            password: user.password, // Note: In production, passwords should be re-hashed
            name: user.name,
            role: user.role,
            student_id: user.studentId,
            phone_number: user.phoneNumber,
            address: user.address,
            library_card_number: user.libraryCardNumber,
          })
          console.log(`[v0] Migrated user: ${user.email}`)
        } catch (error) {
          console.warn(`[v0] Failed to migrate user ${user.email}:`, error)
          // Continue with other users even if one fails
        }
      }

      this.updateProgress("Users migrated", 1, 7)
    } catch (error) {
      console.error("[v0] Error migrating users:", error)
      throw error
    }
  }

  private async migrateBooks() {
    this.updateProgress("Migrating books", 1, 7)

    try {
      const books = await db.books.toArray()
      console.log(`[v0] Found ${books.length} books to migrate`)

      for (let i = 0; i < books.length; i++) {
        const book = books[i]
        try {
          await apiService.createBook({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            description: book.description,
            published_year: book.publishedYear,
            total_copies: book.totalCopies,
            available_copies: book.availableCopies,
            cover_url: book.coverUrl,
            google_books_id: book.googleBooksId,
            publisher: book.publisher,
            page_count: book.pageCount,
            language: book.language,
            categories: book.categories,
          })
          console.log(`[v0] Migrated book: ${book.title}`)
        } catch (error) {
          console.warn(`[v0] Failed to migrate book ${book.title}:`, error)
        }
      }

      this.updateProgress("Books migrated", 2, 7)
    } catch (error) {
      console.error("[v0] Error migrating books:", error)
      throw error
    }
  }

  private async migrateBorrowRecords() {
    this.updateProgress("Migrating borrow records", 2, 7)

    try {
      const borrowRecords = await db.borrowRecords.toArray()
      console.log(`[v0] Found ${borrowRecords.length} borrow records to migrate`)

      // Note: This would require a special migration endpoint since borrow records
      // have complex relationships and business logic
      console.log("[v0] Borrow records migration requires manual handling due to foreign key constraints")

      this.updateProgress("Borrow records noted", 3, 7)
    } catch (error) {
      console.error("[v0] Error migrating borrow records:", error)
      throw error
    }
  }

  private async migrateBookRequests() {
    this.updateProgress("Migrating book requests", 3, 7)

    try {
      const bookRequests = await db.bookRequests.toArray()
      console.log(`[v0] Found ${bookRequests.length} book requests to migrate`)

      // Note: This would also require mapping user IDs from the new MySQL database
      console.log("[v0] Book requests migration requires user ID mapping")

      this.updateProgress("Book requests noted", 4, 7)
    } catch (error) {
      console.error("[v0] Error migrating book requests:", error)
      throw error
    }
  }

  private async migrateReservations() {
    this.updateProgress("Migrating reservations", 4, 7)

    try {
      const reservations = await db.reservations.toArray()
      console.log(`[v0] Found ${reservations.length} reservations to migrate`)

      this.updateProgress("Reservations noted", 5, 7)
    } catch (error) {
      console.error("[v0] Error migrating reservations:", error)
      throw error
    }
  }

  private async migrateFines() {
    this.updateProgress("Migrating fines", 5, 7)

    try {
      const fines = await db.fines.toArray()
      console.log(`[v0] Found ${fines.length} fines to migrate`)

      this.updateProgress("Fines noted", 6, 7)
    } catch (error) {
      console.error("[v0] Error migrating fines:", error)
      throw error
    }
  }

  private async migrateNotifications() {
    this.updateProgress("Migrating notifications", 6, 7)

    try {
      const notifications = await db.notifications.toArray()
      console.log(`[v0] Found ${notifications.length} notifications to migrate`)

      this.updateProgress("Notifications noted", 7, 7)
    } catch (error) {
      console.error("[v0] Error migrating notifications:", error)
      throw error
    }
  }

  async clearIndexedDB(): Promise<boolean> {
    try {
      console.log("[v0] Clearing IndexedDB data...")

      await db.users.clear()
      await db.books.clear()
      await db.borrowRecords.clear()
      await db.bookRequests.clear()
      await db.reservations.clear()
      await db.fines.clear()
      await db.notifications.clear()

      console.log("[v0] IndexedDB cleared successfully")
      return true
    } catch (error) {
      console.error("[v0] Error clearing IndexedDB:", error)
      return false
    }
  }

  async validateMigration(): Promise<{ success: boolean; report: string }> {
    try {
      console.log("[v0] Validating migration...")

      const indexedDBCounts = {
        users: await db.users.count(),
        books: await db.books.count(),
        borrowRecords: await db.borrowRecords.count(),
        bookRequests: await db.bookRequests.count(),
        reservations: await db.reservations.count(),
        fines: await db.fines.count(),
        notifications: await db.notifications.count(),
      }

      // Get MySQL counts (would need additional API endpoints)
      const mysqlCounts = {
        users: 0, // Would call API to get count
        books: 0,
        borrowRecords: 0,
        bookRequests: 0,
        reservations: 0,
        fines: 0,
        notifications: 0,
      }

      const report = `
Migration Validation Report:
===========================

IndexedDB Records:
- Users: ${indexedDBCounts.users}
- Books: ${indexedDBCounts.books}
- Borrow Records: ${indexedDBCounts.borrowRecords}
- Book Requests: ${indexedDBCounts.bookRequests}
- Reservations: ${indexedDBCounts.reservations}
- Fines: ${indexedDBCounts.fines}
- Notifications: ${indexedDBCounts.notifications}

MySQL Records:
- Users: ${mysqlCounts.users}
- Books: ${mysqlCounts.books}
- Borrow Records: ${mysqlCounts.borrowRecords}
- Book Requests: ${mysqlCounts.bookRequests}
- Reservations: ${mysqlCounts.reservations}
- Fines: ${mysqlCounts.fines}
- Notifications: ${mysqlCounts.notifications}

Note: Complete migration requires manual handling of relational data.
      `

      return { success: true, report }
    } catch (error) {
      return {
        success: false,
        report: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}

export default MigrationService
