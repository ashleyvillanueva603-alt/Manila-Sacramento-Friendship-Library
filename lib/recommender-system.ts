// Prescriptive Analytics Recommender System
// Provides personalized book recommendations based on user behavior and preferences

export interface BookRecommendation {
  bookId: string
  title: string
  author: string
  category: string
  coverImage?: string
  recommendationScore: number
  recommendationReasons: string[]
  confidence: number
}

export interface RecommendationContext {
  userId: string
  userRole: "student" | "public"
  borrowHistory: any[]
  allBooks: any[]
  allBorrowHistory: any[]
}

export class RecommenderSystem {
  /**
   * Generate personalized book recommendations using collaborative filtering
   * and content-based filtering
   * Filter out books with no available copies
   */
  static generateRecommendations(context: RecommendationContext, limit = 10): BookRecommendation[] {
    const { userId, userRole, borrowHistory, allBooks, allBorrowHistory } = context

    // Get user's borrow history
    const userBorrows = borrowHistory.filter((b) => b.userId === userId)
    const borrowedBookIds = new Set(userBorrows.map((b) => b.bookId))

    const availableBooks = allBooks.filter((book) => !borrowedBookIds.has(book.id) && (book.available_copies || 0) > 0)

    console.log(
      `[v0] Recommender: Filtered ${allBooks.length - availableBooks.length} out-of-stock books from ${allBooks.length} total books`,
    )

    // Calculate recommendation scores for each available book
    const recommendations: BookRecommendation[] = availableBooks.map((book) => {
      const scores = {
        collaborative: this.calculateCollaborativeScore(userId, book.id, allBorrowHistory),
        contentBased: this.calculateContentBasedScore(userBorrows, book, allBooks),
        popularity: this.calculatePopularityScore(book.id, allBorrowHistory),
        roleSpecific: this.calculateRoleSpecificScore(book, userRole, allBorrowHistory),
        recency: this.calculateRecencyScore(book.id, allBorrowHistory),
      }

      // Weighted combination of scores
      const recommendationScore =
        scores.collaborative * 0.35 +
        scores.contentBased * 0.3 +
        scores.popularity * 0.15 +
        scores.roleSpecific * 0.15 +
        scores.recency * 0.05

      // Generate recommendation reasons
      const reasons = this.generateRecommendationReasons(scores, book, userBorrows, allBooks)

      // Calculate confidence based on data availability
      const confidence = this.calculateConfidence(userBorrows.length, scores)

      return {
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category || "Uncategorized",
        coverImage: book.coverImage,
        recommendationScore,
        recommendationReasons: reasons,
        confidence,
      }
    })

    // Sort by recommendation score and return top N
    const topRecommendations = recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)

    console.log(`[v0] Recommender: Generated ${topRecommendations.length} recommendations (requested ${limit})`)
    return topRecommendations
  }

  /**
   * Collaborative Filtering: Find similar users and recommend what they liked
   */
  private static calculateCollaborativeScore(userId: string, bookId: string, allBorrowHistory: any[]): number {
    // Find users who borrowed the same books as the target user
    const userBorrows = allBorrowHistory.filter((b) => b.userId === userId)
    const userBookIds = new Set(userBorrows.map((b) => b.bookId))

    if (userBookIds.size === 0) return 0

    // Calculate similarity with other users
    const userSimilarities = new Map<string, number>()

    allBorrowHistory.forEach((borrow) => {
      if (borrow.userId === userId) return

      if (userBookIds.has(borrow.bookId)) {
        const currentSimilarity = userSimilarities.get(borrow.userId) || 0
        userSimilarities.set(borrow.userId, currentSimilarity + 1)
      }
    })

    // Find how many similar users borrowed this book
    let similarUsersBorrowedCount = 0
    let totalSimilarUsers = 0

    userSimilarities.forEach((similarity, similarUserId) => {
      totalSimilarUsers++
      const similarUserBorrowed = allBorrowHistory.some((b) => b.userId === similarUserId && b.bookId === bookId)
      if (similarUserBorrowed) {
        similarUsersBorrowedCount += similarity
      }
    })

    if (totalSimilarUsers === 0) return 0

    // Normalize score
    return Math.min(similarUsersBorrowedCount / totalSimilarUsers, 1)
  }

  /**
   * Content-Based Filtering: Recommend books similar to what user has borrowed
   */
  private static calculateContentBasedScore(userBorrows: any[], targetBook: any, allBooks: any[]): number {
    if (userBorrows.length === 0) return 0

    const bookMap = new Map(allBooks.map((b) => [b.id, b]))

    // Analyze user's preferences
    const categoryPreferences = new Map<string, number>()
    const authorPreferences = new Map<string, number>()

    userBorrows.forEach((borrow) => {
      const book = bookMap.get(borrow.bookId)
      if (!book) return

      const category = book.category || "Uncategorized"
      categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + 1)
      authorPreferences.set(book.author, (authorPreferences.get(book.author) || 0) + 1)
    })

    // Calculate similarity score
    let score = 0
    const totalBorrows = userBorrows.length

    // Category match
    const targetCategory = targetBook.category || "Uncategorized"
    const categoryCount = categoryPreferences.get(targetCategory) || 0
    score += (categoryCount / totalBorrows) * 0.6

    // Author match
    const authorCount = authorPreferences.get(targetBook.author) || 0
    score += (authorCount / totalBorrows) * 0.4

    return Math.min(score, 1)
  }

  /**
   * Popularity Score: Recommend popular books
   */
  private static calculatePopularityScore(bookId: string, allBorrowHistory: any[]): number {
    const borrowCount = allBorrowHistory.filter((b) => b.bookId === bookId).length
    const maxBorrows = Math.max(...this.getBookBorrowCounts(allBorrowHistory).values(), 1)

    return borrowCount / maxBorrows
  }

  /**
   * Role-Specific Score: Recommend books popular among similar user roles
   */
  private static calculateRoleSpecificScore(
    book: any,
    userRole: "student" | "public",
    allBorrowHistory: any[],
  ): number {
    const roleBorrows = allBorrowHistory.filter((b) => {
      // Assuming we can determine role from user data in borrow history
      return b.bookId === book.id
    })

    if (roleBorrows.length === 0) return 0

    // Simple popularity among all users (can be enhanced with role data)
    const totalBorrows = allBorrowHistory.filter((b) => b.bookId === book.id).length
    const maxBorrows = Math.max(...this.getBookBorrowCounts(allBorrowHistory).values(), 1)

    return totalBorrows / maxBorrows
  }

  /**
   * Recency Score: Favor recently added or trending books
   */
  private static calculateRecencyScore(bookId: string, allBorrowHistory: any[]): number {
    const bookBorrows = allBorrowHistory.filter((b) => b.bookId === bookId)

    if (bookBorrows.length === 0) return 0

    // Get most recent borrow
    const mostRecentBorrow = bookBorrows.reduce((latest, current) => {
      return new Date(current.borrowDate) > new Date(latest.borrowDate) ? current : latest
    })

    const daysSinceLastBorrow = Math.floor(
      (Date.now() - new Date(mostRecentBorrow.borrowDate).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Decay function: more recent = higher score
    return Math.max(0, 1 - daysSinceLastBorrow / 365)
  }

  /**
   * Generate human-readable recommendation reasons
   */
  private static generateRecommendationReasons(scores: any, book: any, userBorrows: any[], allBooks: any[]): string[] {
    const reasons: string[] = []

    // Collaborative filtering reason
    if (scores.collaborative > 0.3) {
      reasons.push("Users with similar reading preferences enjoyed this book")
    }

    // Content-based reason
    if (scores.contentBased > 0.4) {
      const bookMap = new Map(allBooks.map((b) => [b.id, b]))
      const userCategories = new Set(userBorrows.map((b) => bookMap.get(b.bookId)?.category).filter((c) => c))

      if (userCategories.has(book.category)) {
        reasons.push(`Matches your interest in ${book.category}`)
      }

      const userAuthors = new Set(userBorrows.map((b) => bookMap.get(b.bookId)?.author).filter((a) => a))

      if (userAuthors.has(book.author)) {
        reasons.push(`You've enjoyed other books by ${book.author}`)
      }
    }

    // Popularity reason
    if (scores.popularity > 0.6) {
      reasons.push("Highly popular among library members")
    }

    // Recency reason
    if (scores.recency > 0.7) {
      reasons.push("Trending recently")
    }

    // Default reason if no specific reasons
    if (reasons.length === 0) {
      reasons.push("Recommended based on your reading profile")
    }

    return reasons
  }

  /**
   * Calculate confidence level based on available data
   */
  private static calculateConfidence(userBorrowCount: number, scores: any): number {
    // More user data = higher confidence
    let confidence = Math.min(userBorrowCount / 20, 0.5)

    // Add confidence based on score diversity
    const scoreValues = Object.values(scores) as number[]
    const nonZeroScores = scoreValues.filter((s) => s > 0).length
    confidence += (nonZeroScores / scoreValues.length) * 0.5

    return Math.min(confidence, 1)
  }

  /**
   * Helper: Get borrow counts for all books
   */
  private static getBookBorrowCounts(allBorrowHistory: any[]): Map<string, number> {
    const counts = new Map<string, number>()
    allBorrowHistory.forEach((borrow) => {
      counts.set(borrow.bookId, (counts.get(borrow.bookId) || 0) + 1)
    })
    return counts
  }

  /**
   * Generate category-based recommendations
   * Filter out books with no available copies
   */
  static generateCategoryRecommendations(category: string, allBooks: any[], limit = 5): BookRecommendation[] {
    const categoryBooks = allBooks.filter((book) => book.category === category && (book.available_copies || 0) > 0)

    console.log(`[v0] Category Recommender: Found ${categoryBooks.length} available books in category "${category}"`)

    return categoryBooks.slice(0, limit).map((book) => ({
      bookId: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      coverImage: book.coverImage,
      recommendationScore: 0.8,
      recommendationReasons: [`Popular in ${category} category`],
      confidence: 0.9,
    }))
  }

  /**
   * Generate "You might also like" recommendations based on a specific book
   * Filter out books with no available copies and add fallback logic
   */
  static generateSimilarBookRecommendations(
    bookId: string,
    allBooks: any[],
    allBorrowHistory: any[],
    limit = 5,
  ): BookRecommendation[] {
    const targetBook = allBooks.find((b) => b.id === bookId)
    if (!targetBook) return []

    const similarBooks = allBooks.filter(
      (book) =>
        book.id !== bookId &&
        (book.available_copies || 0) > 0 &&
        (book.category === targetBook.category || book.author === targetBook.author),
    )

    console.log(
      `[v0] Similar Books Recommender: Found ${similarBooks.length} available similar books for "${targetBook.title}"`,
    )

    // Score based on similarity
    const recommendations = similarBooks.map((book) => {
      let score = 0
      const reasons: string[] = []

      if (book.author === targetBook.author) {
        score += 0.6
        reasons.push(`By the same author: ${book.author}`)
      }

      if (book.category === targetBook.category) {
        score += 0.4
        reasons.push(`Similar category: ${book.category}`)
      }

      return {
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        coverImage: book.coverImage,
        recommendationScore: score,
        recommendationReasons: reasons,
        confidence: 0.85,
      }
    })

    if (recommendations.length < limit) {
      const fallbackBooks = allBooks.filter(
        (book) =>
          book.id !== bookId &&
          (book.available_copies || 0) > 0 &&
          !recommendations.some((r) => r.bookId === book.id) &&
          book.category === targetBook.category,
      )

      const fallbackRecommendations = fallbackBooks.slice(0, limit - recommendations.length).map((book) => ({
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        coverImage: book.coverImage,
        recommendationScore: 0.3,
        recommendationReasons: [`Also in ${book.category} category`],
        confidence: 0.7,
      }))

      if (fallbackRecommendations.length > 0) {
        console.log(`[v0] Similar Books Recommender: Added ${fallbackRecommendations.length} fallback recommendations`)
      }

      return recommendations.concat(fallbackRecommendations).slice(0, limit)
    }

    return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit)
  }
}
