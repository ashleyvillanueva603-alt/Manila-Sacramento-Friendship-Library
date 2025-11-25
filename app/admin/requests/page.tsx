"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { MessageSquare, BookOpen, Clock, CheckCircle, XCircle, User, Calendar, Search } from "lucide-react"
import { apiService } from "@/lib/api-service"
import type { BookRequest } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface RequestWithUser extends BookRequest {
  userName?: string
  userEmail?: string
  user_name?: string
  user_email?: string
}

function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestWithUser[]>([])
  const [filteredRequests, setFilteredRequests] = useState<RequestWithUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<RequestWithUser | null>(null)
  const [responseNotes, setResponseNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchQuery, statusFilter])

  const loadRequests = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading book requests from API")
      const response = await apiService.getBookRequests()
      console.log("[v0] Book requests response:", response)

      const allRequests = response.records || response.requests || []
      setRequests(allRequests)
    } catch (error) {
      console.error("[v0] Error loading requests:", error)
      toast({
        title: "Error",
        description: "Failed to load requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          (request.bookTitle || request.book_title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.userName || request.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.reason || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleResponse = async (requestId: number, status: "approved" | "rejected" | "fulfilled") => {
    setResponding(true)
    try {
      console.log("[v0] Updating book request via API:", requestId, status)
      await apiService.updateBookRequest(requestId, status, responseNotes)

      toast({
        title: "Request Updated",
        description: `Request has been ${status}.`,
      })

      setSelectedRequest(null)
      setResponseNotes("")
      loadRequests()
    } catch (error) {
      console.error("[v0] Error updating request:", error)
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResponding(false)
    }
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

  const getPriorityRequests = () => {
    return filteredRequests.filter((request) => request.status === "pending").slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Requests Management</h1>
        <p className="text-muted-foreground">Review and manage student book requests for the library collection.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === "approved").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === "fulfilled").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const bookTitle = request.bookTitle || request.book_title || "Unknown Book"
          const userName = request.userName || request.user_name || "Unknown User"
          const requestDate = request.requestDate || request.request_date

          return (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{bookTitle}</h3>
                    {request.author && <p className="text-muted-foreground mb-2">by {request.author}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(requestDate).toLocaleDateString()}
                      </div>
                      {request.isbn && <span>ISBN: {request.isbn}</span>}
                    </div>
                    <p className="text-sm mb-4">{request.reason}</p>
                    {(request.librarianNotes || request.librarian_notes) && (
                      <Alert className="mb-4">
                        <AlertDescription className="text-sm">
                          <strong>Your Notes:</strong> {request.librarianNotes || request.librarian_notes}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${getStatusColor(request.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </Badge>
                    {request.status === "pending" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setResponseNotes(request.librarianNotes || request.librarian_notes || "")
                            }}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Book Request</DialogTitle>
                            <DialogDescription>Review and respond to this book request.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">{bookTitle}</h4>
                              {request.author && <p className="text-sm text-muted-foreground">by {request.author}</p>}
                              <p className="text-sm mt-2">{request.reason}</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Response Notes</Label>
                              <Textarea
                                id="notes"
                                value={responseNotes}
                                onChange={(e) => setResponseNotes(e.target.value)}
                                placeholder="Add notes for the student..."
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResponse(request.id!, "approved")}
                                disabled={responding}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleResponse(request.id!, "rejected")}
                                disabled={responding}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                            {request.status === "approved" && (
                              <Button
                                onClick={() => handleResponse(request.id!, "fulfilled")}
                                disabled={responding}
                                variant="outline"
                                className="w-full"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Mark as Fulfilled
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No book requests have been submitted yet."}
          </p>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireLibrarian>
      <AdminRequestsPage />
    </AuthGuard>
  )
}
