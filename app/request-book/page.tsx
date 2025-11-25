"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { MessageSquare, BookOpen, Clock, CheckCircle, XCircle, Send } from "lucide-react"
import { apiService } from "@/lib/api-service"
import type { BookRequest } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

function RequestBookPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bookTitle: "",
    author: "",
    isbn: "",
    reason: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadUserRequests()
    }
  }, [user])

  const loadUserRequests = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log("[v0] Loading book requests from API for user:", user.id)
      const response = await apiService.getBookRequests(user.id)
      console.log("[v0] Book requests response:", response)

      const userRequests = response.records || response.requests || []
      setRequests(userRequests)
    } catch (error) {
      console.error("[v0] Error loading requests:", error)
      toast({
        title: "Error",
        description: "Failed to load your requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      console.log("[v0] Submitting book request via API")
      await apiService.createBookRequest({
        user_id: user.id,
        book_title: formData.bookTitle,
        author: formData.author,
        isbn: formData.isbn,
        reason: formData.reason,
      })

      setFormData({
        bookTitle: "",
        author: "",
        isbn: "",
        reason: "",
      })

      toast({
        title: "Request Submitted",
        description: "Your book request has been submitted successfully.",
      })

      loadUserRequests()
    } catch (error) {
      console.error("[v0] Error submitting request:", error)
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "fulfilled":
        return <BookOpen className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "fulfilled":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Request a Book</h1>
        <p className="text-muted-foreground">
          Can't find a book in our collection? Request it here and we'll consider adding it to our library.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit New Request
            </CardTitle>
            <CardDescription>Fill out the form below to request a new book for our library collection.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookTitle">Book Title *</Label>
                <Input
                  id="bookTitle"
                  value={formData.bookTitle}
                  onChange={(e) => handleInputChange("bookTitle", e.target.value)}
                  placeholder="Enter the book title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  placeholder="Enter the author's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (if known)</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange("isbn", e.target.value)}
                  placeholder="978-0-123456-78-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want this book? *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  placeholder="Please explain why you'd like this book added to our collection..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Requests
            </CardTitle>
            <CardDescription>Track the status of your book requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold line-clamp-1">{request.bookTitle || request.book_title}</h4>
                      <Badge className={`ml-2 ${getStatusColor(request.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </Badge>
                    </div>

                    {request.author && <p className="text-sm text-muted-foreground mb-2">by {request.author}</p>}

                    <p className="text-sm mb-3 line-clamp-2">{request.reason}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Requested: {new Date(request.requestDate || request.request_date).toLocaleDateString()}
                      </span>
                      {(request.responseDate || request.response_date) && (
                        <span>
                          Responded: {new Date(request.responseDate || request.response_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {(request.librarianNotes || request.librarian_notes) && (
                      <Alert className="mt-3">
                        <AlertDescription className="text-sm">
                          <strong>Librarian Notes:</strong> {request.librarianNotes || request.librarian_notes}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No requests yet</p>
                <p className="text-sm text-muted-foreground">
                  Submit your first book request using the form on the left.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Request Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What to Include:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Complete book title and author name</li>
                <li>• ISBN if available (helps us find the exact edition)</li>
                <li>• Clear reason for the request</li>
                <li>• Academic or educational value</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Processing Time:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Requests are reviewed weekly</li>
                <li>• You'll receive an email notification when reviewed</li>
                <li>• Approved books typically arrive within 2-4 weeks</li>
                <li>• Popular requests are prioritized</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireStudent>
      <RequestBookPage />
    </AuthGuard>
  )
}
