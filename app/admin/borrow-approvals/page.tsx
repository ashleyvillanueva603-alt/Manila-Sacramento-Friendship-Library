"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CheckCircle, XCircle, Clock, BookOpen, User } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useAuth } from "@/hooks/use-auth"

interface PendingBorrow {
  id: number
  user_id: number
  user_name: string
  user_email: string
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  borrow_date: string
  due_date: string
  created_at: string
}

function BorrowApprovalsPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingBorrow[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({})
  const { user } = useAuth()

  useEffect(() => {
    loadPendingRequests()
  }, [])

  const loadPendingRequests = async () => {
    try {
      console.log("[v0] Loading pending borrow requests...")
      const response = await apiService.getPendingBorrows()

      if (response.success && response.records) {
        setPendingRequests(response.records)
        console.log("[v0] Loaded pending requests:", response.records.length)
      } else {
        console.log("[v0] No pending requests found")
        setPendingRequests([])
      }
    } catch (error) {
      console.error("[v0] Error loading pending requests:", error)
      setPendingRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (borrowId: number) => {
    try {
      setPendingRequests((prev) => prev.filter((req) => req.id !== borrowId))

      const response = await apiService.approveBorrow(borrowId, user?.id || 0)

      if (response.success) {
        alert("Borrow request approved successfully")
        setTimeout(() => loadPendingRequests(), 500)
      }
    } catch (error) {
      console.error("[v0] Error approving request:", error)
      alert("Failed to approve request. Please try again.")
      loadPendingRequests()
    }
  }

  const handleReject = async (borrowId: number) => {
    const reason = rejectionReason[borrowId] || ""
    if (!reason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    try {
      setPendingRequests((prev) => prev.filter((req) => req.id !== borrowId))

      const response = await apiService.rejectBorrow(borrowId, user?.id || 0, reason)

      if (response.success) {
        alert("Borrow request rejected")
        setTimeout(() => loadPendingRequests(), 500)
        setRejectionReason({ ...rejectionReason, [borrowId]: "" })
      }
    } catch (error) {
      console.error("[v0] Error rejecting request:", error)
      alert("Failed to reject request. Please try again.")
      loadPendingRequests()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Borrow Request Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending borrow requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground">All borrow requests have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={request.book_cover || "/placeholder.svg"}
                        alt={request.book_title}
                        className="w-20 h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              {request.book_title}
                            </h3>
                            <p className="text-muted-foreground">by {request.book_author}</p>
                          </div>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.user_name}</span>
                          <span className="text-muted-foreground">({request.user_email})</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Requested</p>
                            <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Borrow Date</p>
                            <p className="font-medium">{new Date(request.borrow_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(request.due_date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Textarea
                            placeholder="Reason for rejection (optional)"
                            value={rejectionReason[request.id] || ""}
                            onChange={(e) => setRejectionReason({ ...rejectionReason, [request.id]: e.target.value })}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleApprove(request.id)} className="flex-1" variant="default">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={() => handleReject(request.id)} className="flex-1" variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireLibrarian>
      <AdminLayout>
        <BorrowApprovalsPage />
      </AdminLayout>
    </AuthGuard>
  )
}
