import { apiService } from "./api-service"
import type { Book } from "./database"

export interface RecommendedBook extends Book {
  recommendationScore: number
  recommendationReason: string
  available_copies: number
}

export interface RecommendationContext {
  topGenres: string[]
  genreFrequency: Map<string, number>
  totalBorrows: number
}

class RecommendationService {
  /**
   * Get personalized book recommendations based on user's borrowing history
   * Similar to Netflix's recommendation algorithm
   * Enhanced filtering and logging for out-of-stock books
   */
  static async getRecommendations(userId: number, limit = 6): Promise<RecommendedBook[]> {
    try {
      console.log("[v0] Getting recommendations for user:", userId)

      const borrowResponse = await apiService.getBorrowHistory(userId)
      const userBorrows = borrowResponse.records || []
      console.log("[v0] User borrow history:", userBorrows.length, "records")

      if (userBorrows.length === 0) {
        // If no history, return popular books (most borrowed)
        return this.getPopularBooks(limit)
      }

      // Get the books user has borrowed
      const borrowedBookIds = userBorrows.map((record: any) => record.book_id)
      console.log("[v0] Borrowed book IDs:", borrowedBookIds)

      const booksResponse = await apiService.getBooks("", "", 1000, 0)
      const allBooks = booksResponse.records || []
      console.log("[v0] Total books in database:", allBooks.length)

      // Get borrowed books details
      const borrowedBooks = allBooks.filter((book: any) => borrowedBookIds.includes(book.id))

      // Analyze user preferences
      const genreFrequency = new Map<string, number>()
      const authorFrequency = new Map<string, number>()

      borrowedBooks.forEach((book: any) => {
        // Count genres
        genreFrequency.set(book.genre, (genreFrequency.get(book.genre) || 0) + 1)
        // Count authors
        authorFrequency.set(book.author, (authorFrequency.get(book.author) || 0) + 1)
      })

      console.log("[v0] Genre preferences:", Array.from(genreFrequency.entries()))
      console.log("[v0] Author preferences:", Array.from(authorFrequency.entries()))

      // Get books that user hasn't borrowed
      const unborrowed = allBooks.filter((book: any) => !borrowedBookIds.includes(book.id))
      console.log("[v0] Unborrowed books:", unborrowed.length)

      // Score each book based on user preferences
      const scoredBooks: RecommendedBook[] = unborrowed.map((book: any) => {
        let score = 0
        const reasons: string[] = []

        // Genre matching (highest weight)
        const genreScore = genreFrequency.get(book.genre) || 0
        if (genreScore > 0) {
          score += genreScore * 10
          reasons.push(`You enjoy ${book.genre}`)
        }

        // Author matching (medium weight)
        const authorScore = authorFrequency.get(book.author) || 0
        if (authorScore > 0) {
          score += authorScore * 8
          reasons.push(`You've read ${book.author} before`)
        }

        const availableCopies = book.available_copies || 0
        if (availableCopies > 0) {
          score += 2
        }

        // Recent publication bonus (small weight)
        const currentYear = new Date().getFullYear()
        const publishedYear = book.published_year || 0
        if (publishedYear >= currentYear - 10) {
          score += 1
          if (publishedYear >= currentYear - 3) {
            reasons.push("Recent release")
          }
        }

        // Default reason if no specific match
        if (reasons.length === 0) {
          reasons.push("Popular in our collection")
        }

        return {
          ...book,
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          genre: book.genre,
          description: book.description || "",
          publishedYear: publishedYear,
          totalCopies: book.total_copies || 0,
          availableCopies: availableCopies,
          available_copies: availableCopies,
          coverImage: book.cover_url || "",
          googleBooksId: book.google_books_id,
          publisher: book.publisher,
          pageCount: book.page_count,
          language: book.language,
          categories: book.categories || [book.genre],
          recommendationScore: score,
          recommendationReason: reasons[0],
        } as RecommendedBook
      })

      const availableBooks = scoredBooks.filter((book) => book.available_copies > 0)
      const filteredOutCount = scoredBooks.length - availableBooks.length
      if (filteredOutCount > 0) {
        console.log(`[v0] Filtered out ${filteredOutCount} out-of-stock books from recommendations`)
      }

      // Sort by score and return top recommendations
      const topRecommendations = availableBooks
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)

      console.log("[v0] Top recommendations:", topRecommendations.length)
      return topRecommendations
    } catch (error) {
      console.error("[v0] Error generating recommendations:", error)
      return []
    }
  }

  static async getUserGenrePreferences(userId: number): Promise<RecommendationContext> {
    try {
      const borrowResponse = await apiService.getBorrowHistory(userId)
      const userBorrows = borrowResponse.records || []

      if (userBorrows.length === 0) {
        return {
          topGenres: [],
          genreFrequency: new Map(),
          totalBorrows: 0,
        }
      }

      const borrowedBookIds = userBorrows.map((record: any) => record.book_id)
      const booksResponse = await apiService.getBooks("", "", 1000, 0)
      const allBooks = booksResponse.records || []
      const borrowedBooks = allBooks.filter((book: any) => borrowedBookIds.includes(book.id))

      const genreFrequency = new Map<string, number>()
      borrowedBooks.forEach((book: any) => {
        genreFrequency.set(book.genre, (genreFrequency.get(book.genre) || 0) + 1)
      })

      const topGenres = Array.from(genreFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre)

      return {
        topGenres,
        genreFrequency,
        totalBorrows: userBorrows.length,
      }
    } catch (error) {
      console.error("[v0] Error getting genre preferences:", error)
      return {
        topGenres: [],
        genreFrequency: new Map(),
        totalBorrows: 0,
      }
    }
  }

  /**
   * Get popular books for users with no borrowing history
   * Enhanced filtering and logging for out-of-stock books
   */
  private static async getPopularBooks(limit: number): Promise<RecommendedBook[]> {
    try {
      console.log("[v0] Getting popular books (no user history)")

      const borrowResponse = await apiService.getBorrowHistory(undefined, 1000, 0)
      const allBorrows = borrowResponse.records || []

      // Count borrows per book
      const borrowCounts = new Map<number, number>()
      allBorrows.forEach((record: any) => {
        borrowCounts.set(record.book_id, (borrowCounts.get(record.book_id) || 0) + 1)
      })

      const booksResponse = await apiService.getBooks("", "", 1000, 0)
      const allBooks = booksResponse.records || []

      // Score books by popularity
      const scoredBooks: RecommendedBook[] = allBooks.map((book: any) => {
        const borrowCount = borrowCounts.get(book.id) || 0
        const availableCopies = book.available_copies || 0

        return {
          ...book,
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          genre: book.genre,
          description: book.description || "",
          publishedYear: book.published_year || 0,
          totalCopies: book.total_copies || 0,
          availableCopies: availableCopies,
          available_copies: availableCopies,
          coverImage: book.cover_url || "",
          googleBooksId: book.google_books_id,
          publisher: book.publisher,
          pageCount: book.page_count,
          language: book.language,
          categories: book.categories || [book.genre],
          recommendationScore: borrowCount,
          recommendationReason: borrowCount > 0 ? "Popular with other readers" : "New in our collection",
        } as RecommendedBook
      })

      const availableBooks = scoredBooks.filter((book) => book.available_copies > 0)
      const filteredOutCount = scoredBooks.length - availableBooks.length
      if (filteredOutCount > 0) {
        console.log(
          `[v0] Popular Books: Filtered out ${filteredOutCount} out-of-stock books from ${scoredBooks.length} total`,
        )
      }

      // Sort by popularity and availability
      const topBooks = availableBooks
        .sort((a, b) => {
          // Prioritize available books
          if (a.available_copies > 0 && b.available_copies === 0) return -1
          if (a.available_copies === 0 && b.available_copies > 0) return 1
          // Then by popularity
          return b.recommendationScore - a.recommendationScore
        })
        .slice(0, limit)

      console.log("[v0] Popular books:", topBooks.length)
      return topBooks
    } catch (error) {
      console.error("[v0] Error getting popular books:", error)
      return []
    }
  }

  /**
   * Get books similar to a specific book
   * Enhanced filtering and logging for out-of-stock books
   */
  static async getSimilarBooks(bookId: number, limit = 4): Promise<RecommendedBook[]> {
    try {
      const bookResponse = await apiService.getBook(bookId)
      const book = bookResponse.records?.[0] || bookResponse
      if (!book) return []

      const booksResponse = await apiService.getBooks("", "", 1000, 0)
      const allBooks = booksResponse.records || []
      const otherBooks = allBooks.filter((b: any) => b.id !== bookId)

      // Score based on similarity
      const scoredBooks: RecommendedBook[] = otherBooks.map((b: any) => {
        let score = 0
        let reason = ""

        // Same genre (highest weight)
        if (b.genre === book.genre) {
          score += 10
          reason = `Similar genre: ${b.genre}`
        }

        // Same author (high weight)
        if (b.author === book.author) {
          score += 8
          reason = `Same author: ${b.author}`
        }

        // Similar publication year (small weight)
        const yearDiff = Math.abs((b.published_year || 0) - (book.published_year || 0))
        if (yearDiff <= 5) {
          score += 2
        }

        if (!reason) {
          reason = "You might also like this"
        }

        const availableCopies = b.available_copies || 0

        return {
          ...b,
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          genre: b.genre,
          description: b.description || "",
          publishedYear: b.published_year || 0,
          totalCopies: b.total_copies || 0,
          availableCopies: availableCopies,
          available_copies: availableCopies,
          coverImage: b.cover_url || "",
          googleBooksId: b.google_books_id,
          publisher: b.publisher,
          pageCount: b.page_count,
          language: b.language,
          categories: b.categories || [b.genre],
          recommendationScore: score,
          recommendationReason: reason,
        } as RecommendedBook
      })

      const availableBooks = scoredBooks.filter((book) => book.available_copies > 0)
      const filteredOutCount = scoredBooks.length - availableBooks.length
      if (filteredOutCount > 0) {
        console.log(`[v0] Similar Books: Filtered out ${filteredOutCount} out-of-stock books for book ID ${bookId}`)
      }

      return availableBooks.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit)
    } catch (error) {
      console.error("[v0] Error getting similar books:", error)
      return []
    }
  }
}

export { RecommendationService }
