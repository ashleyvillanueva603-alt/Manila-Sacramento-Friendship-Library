"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, MapPin, Clock, Phone, Mail, Users, Sparkles, Star, TrendingUp } from "lucide-react"
import { db, type Book } from "@/lib/database"
import Link from "next/link"

export default function PublicHomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const [loading, setLoading] = useState(true)

  // Get unique genres for filter
  const genres = Array.from(new Set(books.map((book) => book.genre).filter(Boolean)))

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    filterAndSortBooks()
  }, [books, searchQuery, selectedGenre, sortBy])

  const loadBooks = async () => {
    try {
      const allBooks = await db.books.orderBy("title").toArray()
      // Only show books that are available
      const availableBooks = allBooks.filter((book) => book.availableCopies > 0)
      setBooks(availableBooks)
    } catch (error) {
      console.error("Error loading books:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortBooks = () => {
    let filtered = books

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.genre.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((book) => book.genre === selectedGenre)
    }

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        case "year":
          return b.publishedYear - a.publishedYear
        case "availability":
          return b.availableCopies - a.availableCopies
        default:
          return 0
      }
    })

    setFilteredBooks(filtered)
  }

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg-dark">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-4 mb-8">
              <img
                src="/library-logo-new-removebg-preview.png" // <-- your image inside public folder
                alt="Book Icon"
                className="h-20 w-20 object-contain"
              />
            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-primary">LibraryHub</h1>
              <p className="text-sm text-muted-foreground">Modern Library Management</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Discover your next great read
          </div>

          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-balance">
            Explore thousands of books, digital resources, and knowledge at your fingertips. Join our community of
            readers and start your literary journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="min-w-[180px] h-12 rounded-xl">
                <Users className="h-5 w-5 mr-2" />
                Student Login
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[180px] h-12 rounded-xl bg-transparent backdrop-blur-sm"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Librarian Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visit Our Library</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Located in the heart of the city, we're here to serve your educational and reading needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  123 Library Street
                  <br />
                  City Center, State 12345
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-4">
                <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mon-Fri: 8:00 AM - 8:00 PM
                  <br />
                  Sat-Sun: 10:00 AM - 6:00 PM
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-4">
                <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Phone: (555) 123-4567
                  <br />
                  Email: info@libraryhub.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Featured Collection
            </div>
            <h2 className="text-4xl font-bold mb-4">Browse Our Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our extensive collection of books across various genres. All books shown below are currently
              available for borrowing.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search books by title, author, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-background/50 backdrop-blur-sm rounded-xl"
                />
              </div>
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-0 bg-background/50 backdrop-blur-sm rounded-xl">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-0 bg-background/50 backdrop-blur-sm rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="author">Author A-Z</SelectItem>
                <SelectItem value="year">Newest First</SelectItem>
                <SelectItem value="availability">Most Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading our amazing collection...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Showing {filteredBooks.length} available books
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="h-full card-hover border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex gap-3">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl || "/placeholder.svg"}
                            alt={book.title}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-muted/50 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm line-clamp-2 mb-1">{book.title}</CardTitle>
                          <CardDescription className="text-xs mb-2">by {book.author}</CardDescription>
                          <Badge variant="secondary" className="text-xs">
                            {book.genre}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {book.description && (
                          <p className="text-xs text-muted-foreground line-clamp-3">{book.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Published: {book.publishedYear}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-primary font-medium">{book.availableCopies} available</span>
                          </div>
                        </div>
                        {book.publisher && <p className="text-xs text-muted-foreground">Publisher: {book.publisher}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedGenre !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No books are currently available."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Join our community
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
            Join our library community today! Register as a student to borrow books, access digital resources, and
            participate in library events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] h-12 rounded-xl">
                <Users className="h-5 w-5 mr-2" />
                Register as Student
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] h-12 rounded-xl bg-transparent backdrop-blur-sm"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-card/50 backdrop-blur-sm border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-bold text-lg">LibraryHub</span>
                <p className="text-xs text-muted-foreground">Modern Library Management</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@libraryhub.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (555) 123-4567
              </div>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 LibraryHub. All rights reserved. • Built with modern technology for the future of libraries.
          </div>
        </div>
      </footer>
    </div>
  )
}
