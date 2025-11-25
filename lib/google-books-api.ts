// Google Books API integration service
export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    language?: string
  }
}

export interface GoogleBooksSearchResponse {
  items?: GoogleBook[]
  totalItems: number
}

class GoogleBooksService {
  private readonly baseUrl = "https://www.googleapis.com/books/v1/volumes"

  async searchBooks(query: string, maxResults = 10): Promise<GoogleBooksSearchResponse> {
    try {
      const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`)
      }

      const data: GoogleBooksSearchResponse = await response.json()
      return data
    } catch (error) {
      console.error("Error searching Google Books:", error)
      return { totalItems: 0, items: [] }
    }
  }

  async getBookById(googleBooksId: string): Promise<GoogleBook | null> {
    try {
      const url = `${this.baseUrl}/${googleBooksId}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`)
      }

      const data: GoogleBook = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching book from Google Books:", error)
      return null
    }
  }

  // Convert Google Book to our Book interface
  convertToBook(
    googleBook: GoogleBook,
  ): Omit<import("./database").Book, "id" | "createdAt" | "totalCopies" | "availableCopies"> {
    const volumeInfo = googleBook.volumeInfo
    const isbn =
      volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13" || id.type === "ISBN_10")?.identifier || ""

    return {
      title: volumeInfo.title || "Unknown Title",
      author: volumeInfo.authors?.join(", ") || "Unknown Author",
      isbn,
      genre: volumeInfo.categories?.[0] || "General",
      description: volumeInfo.description || "",
      publishedYear: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 0,
      coverUrl: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      googleBooksId: googleBook.id,
      publisher: volumeInfo.publisher,
      pageCount: volumeInfo.pageCount,
      language: volumeInfo.language || "en",
      categories: volumeInfo.categories,
    }
  }
}

export const googleBooksService = new GoogleBooksService()
