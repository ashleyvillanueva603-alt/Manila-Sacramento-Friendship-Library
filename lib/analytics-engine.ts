// Descriptive Analytics Engine for Library Management System
// Analyzes book usage patterns, borrowed frequency, and borrower preferences

export interface BookUsageStats {
  bookId: string
  title: string
  author: string
  totalBorrows: number
  uniqueBorrowers: number
  averageBorrowDuration: number
  currentlyBorrowed: number
  popularityScore: number
  category: string
  lastBorrowed?: Date
}

export interface BorrowerPreferences {
  userId: string
  userName: string
  favoriteCategories: { category: string; count: number; percentage: number }[]
  favoriteAuthors: { author: string; count: number }[]
  totalBorrows: number
  averageReadingTime: number
  mostBorrowedBooks: { bookId: string; title: string; borrowCount: number }[]
  readingPattern: "frequent" | "moderate" | "occasional"
}

export interface CategoryAnalytics {
  category: string
  totalBooks: number
  totalBorrows: number
  averageBorrowsPerBook: number
  popularityRank: number
  trendDirection: "increasing" | "stable" | "decreasing"
}

export interface TimeSeriesData {
  date: string
  borrows: number
  returns: number
  activeUsers: number
}

export class AnalyticsEngine {
  /**
   * Calculate comprehensive book usage statistics
   */
  static calculateBookUsageStats(books: any[], borrowHistory: any[]): BookUsageStats[] {
    const bookStats = new Map<string, BookUsageStats>()

    // Initialize stats for all books
    books.forEach((book) => {
      bookStats.set(book.id, {
        bookId: book.id,
        title: book.title,
        author: book.author,
        totalBorrows: 0,
        uniqueBorrowers: 0,
        averageBorrowDuration: 0,
        currentlyBorrowed: book.status === "borrowed" ? 1 : 0,
        popularityScore: 0,
        category: book.category || "Uncategorized",
      })
    })

    // Analyze borrow history
    const borrowersByBook = new Map<string, Set<string>>()
    const durationsByBook = new Map<string, number[]>()

    borrowHistory.forEach((record) => {
      const stats = bookStats.get(record.bookId)
      if (!stats) return

      // Count total borrows
      stats.totalBorrows++

      // Track unique borrowers
      if (!borrowersByBook.has(record.bookId)) {
        borrowersByBook.set(record.bookId, new Set())
      }
      borrowersByBook.get(record.bookId)!.add(record.userId)

      // Calculate borrow duration
      if (record.returnDate) {
        const duration = Math.floor(
          (new Date(record.returnDate).getTime() - new Date(record.borrowDate).getTime()) / (1000 * 60 * 60 * 24),
        )
        if (!durationsByBook.has(record.bookId)) {
          durationsByBook.set(record.bookId, [])
        }
        durationsByBook.get(record.bookId)!.push(duration)
      }

      // Track last borrowed date
      const borrowDate = new Date(record.borrowDate)
      if (!stats.lastBorrowed || borrowDate > stats.lastBorrowed) {
        stats.lastBorrowed = borrowDate
      }
    })

    // Calculate final statistics
    bookStats.forEach((stats, bookId) => {
      // Unique borrowers
      stats.uniqueBorrowers = borrowersByBook.get(bookId)?.size || 0

      // Average borrow duration
      const durations = durationsByBook.get(bookId) || []
      if (durations.length > 0) {
        stats.averageBorrowDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      }

      // Popularity score (weighted formula)
      const recencyWeight = stats.lastBorrowed
        ? Math.max(0, 1 - (Date.now() - stats.lastBorrowed.getTime()) / (365 * 24 * 60 * 60 * 1000))
        : 0
      stats.popularityScore = stats.totalBorrows * 0.4 + stats.uniqueBorrowers * 0.4 + recencyWeight * 20
    })

    return Array.from(bookStats.values()).sort((a, b) => b.popularityScore - a.popularityScore)
  }

  /**
   * Analyze borrower preferences and reading patterns
   */
  static analyzeBorrowerPreferences(
    userId: string,
    userName: string,
    borrowHistory: any[],
    books: any[],
  ): BorrowerPreferences {
    const userBorrows = borrowHistory.filter((b) => b.userId === userId)
    const bookMap = new Map(books.map((b) => [b.id, b]))

    // Category preferences
    const categoryCount = new Map<string, number>()
    const authorCount = new Map<string, number>()
    const bookBorrowCount = new Map<string, number>()
    const durations: number[] = []

    userBorrows.forEach((borrow) => {
      const book = bookMap.get(borrow.bookId)
      if (!book) return

      // Count categories
      const category = book.category || "Uncategorized"
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1)

      // Count authors
      authorCount.set(book.author, (authorCount.get(book.author) || 0) + 1)

      // Count book borrows
      bookBorrowCount.set(borrow.bookId, (bookBorrowCount.get(borrow.bookId) || 0) + 1)

      // Calculate duration
      if (borrow.returnDate) {
        const duration = Math.floor(
          (new Date(borrow.returnDate).getTime() - new Date(borrow.borrowDate).getTime()) / (1000 * 60 * 60 * 24),
        )
        durations.push(duration)
      }
    })

    // Calculate percentages for categories
    const totalBorrows = userBorrows.length
    const favoriteCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalBorrows) * 100,
      }))
      .sort((a, b) => b.count - a.count)

    // Top authors
    const favoriteAuthors = Array.from(authorCount.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Most borrowed books
    const mostBorrowedBooks = Array.from(bookBorrowCount.entries())
      .map(([bookId, borrowCount]) => {
        const book = bookMap.get(bookId)
        return {
          bookId,
          title: book?.title || "Unknown",
          borrowCount,
        }
      })
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5)

    // Average reading time
    const averageReadingTime = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

    // Determine reading pattern
    let readingPattern: "frequent" | "moderate" | "occasional" = "occasional"
    if (totalBorrows > 20) readingPattern = "frequent"
    else if (totalBorrows > 10) readingPattern = "moderate"

    return {
      userId,
      userName,
      favoriteCategories,
      favoriteAuthors,
      totalBorrows,
      averageReadingTime,
      mostBorrowedBooks,
      readingPattern,
    }
  }

  /**
   * Analyze category performance and trends
   */
  static analyzeCategoryPerformance(books: any[], borrowHistory: any[]): CategoryAnalytics[] {
    const categoryStats = new Map<
      string,
      {
        totalBooks: number
        totalBorrows: number
        recentBorrows: number
        oldBorrows: number
      }
    >()

    // Count books per category
    books.forEach((book) => {
      const category = book.category || "Uncategorized"
      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          totalBooks: 0,
          totalBorrows: 0,
          recentBorrows: 0,
          oldBorrows: 0,
        })
      }
      categoryStats.get(category)!.totalBooks++
    })

    // Analyze borrows
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const bookMap = new Map(books.map((b) => [b.id, b]))

    borrowHistory.forEach((borrow) => {
      const book = bookMap.get(borrow.bookId)
      if (!book) return

      const category = book.category || "Uncategorized"
      const stats = categoryStats.get(category)
      if (!stats) return

      stats.totalBorrows++

      const borrowDate = new Date(borrow.borrowDate)
      if (borrowDate > threeMonthsAgo) {
        stats.recentBorrows++
      } else {
        stats.oldBorrows++
      }
    })

    // Calculate analytics
    const analytics: CategoryAnalytics[] = Array.from(categoryStats.entries()).map(([category, stats]) => {
      const averageBorrowsPerBook = stats.totalBooks > 0 ? stats.totalBorrows / stats.totalBooks : 0

      // Determine trend
      let trendDirection: "increasing" | "stable" | "decreasing" = "stable"
      if (stats.recentBorrows > stats.oldBorrows * 1.2) {
        trendDirection = "increasing"
      } else if (stats.recentBorrows < stats.oldBorrows * 0.8) {
        trendDirection = "decreasing"
      }

      return {
        category,
        totalBooks: stats.totalBooks,
        totalBorrows: stats.totalBorrows,
        averageBorrowsPerBook,
        popularityRank: 0, // Will be set after sorting
        trendDirection,
      }
    })

    // Sort by total borrows and assign ranks
    analytics.sort((a, b) => b.totalBorrows - a.totalBorrows)
    analytics.forEach((item, index) => {
      item.popularityRank = index + 1
    })

    return analytics
  }

  /**
   * Generate time series data for trend analysis
   */
  static generateTimeSeriesData(borrowHistory: any[], days = 30): TimeSeriesData[] {
    const timeSeriesMap = new Map<string, TimeSeriesData>()
    const today = new Date()

    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      timeSeriesMap.set(dateStr, {
        date: dateStr,
        borrows: 0,
        returns: 0,
        activeUsers: 0,
      })
    }

    // Count borrows and returns
    const activeUsersByDate = new Map<string, Set<string>>()

    borrowHistory.forEach((record) => {
      // Count borrows
      const borrowDate = new Date(record.borrowDate).toISOString().split("T")[0]
      if (timeSeriesMap.has(borrowDate)) {
        const data = timeSeriesMap.get(borrowDate)!
        data.borrows++

        // Track active users
        if (!activeUsersByDate.has(borrowDate)) {
          activeUsersByDate.set(borrowDate, new Set())
        }
        activeUsersByDate.get(borrowDate)!.add(record.userId)
      }

      // Count returns
      if (record.returnDate) {
        const returnDate = new Date(record.returnDate).toISOString().split("T")[0]
        if (timeSeriesMap.has(returnDate)) {
          timeSeriesMap.get(returnDate)!.returns++
        }
      }
    })

    // Set active users count
    activeUsersByDate.forEach((users, date) => {
      const data = timeSeriesMap.get(date)
      if (data) {
        data.activeUsers = users.size
      }
    })

    return Array.from(timeSeriesMap.values())
  }

  /**
   * Calculate overall library statistics
   */
  static calculateOverallStats(books: any[], borrowHistory: any[], users: any[]) {
    const totalBooks = books.length
    const availableBooks = books.filter((b) => b.status === "available").length
    const borrowedBooks = books.filter((b) => b.status === "borrowed").length
    const totalBorrows = borrowHistory.length
    const activeUsers = new Set(borrowHistory.map((b) => b.userId)).size
    const totalUsers = users.length

    // Calculate average borrow duration
    const completedBorrows = borrowHistory.filter((b) => b.returnDate)
    const averageBorrowDuration =
      completedBorrows.length > 0
        ? completedBorrows.reduce((sum, b) => {
            const duration = Math.floor(
              (new Date(b.returnDate).getTime() - new Date(b.borrowDate).getTime()) / (1000 * 60 * 60 * 24),
            )
            return sum + duration
          }, 0) / completedBorrows.length
        : 0

    // Calculate utilization rate
    const utilizationRate = totalBooks > 0 ? (borrowedBooks / totalBooks) * 100 : 0

    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalBorrows,
      activeUsers,
      totalUsers,
      averageBorrowDuration,
      utilizationRate,
    }
  }
}
