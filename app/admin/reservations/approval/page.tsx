"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { apiService } from "@/lib/api-service"
import { BookOpen, CheckCircle, XCircle } from "lucide-react"

interface FulfilledReservation {
  id: number
  user_id: number
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  user_name: string
  user_email: string
  student_id: string
  fulfilled_at: string
  reservation_date: string
}

function ReservationApprovalPage() {
  const [reservations, setReservations] = useState<FulfilledReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingKey, setProcessingKey] = useState<string | null>(null)
  const { user } = useAuth()

  const loadReservations = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading fulfilled reservations for approval...")
      const response = await apiService.getFullfilledReservations(undefined, 50, 0)
      console.log("[v0] Fulfilled reservations response:", response)

      if (response.success && response.records) {
        setReservations(response.records)
      } else {
        setReservations([])
      }
    } catch (error) {
      console.error("[v0] Error loading reservations:", error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const handleApproveReservation = async (userId: number, bookId: number) => {
    if (!user) return
    if (!confirm("Approve this reservation? The book will be marked as borrowed by the student.")) return

    const key = `${userId}-${bookId}`
    setProcessingKey(key)
    try {
      const result = await apiService.approveReservation(userId, bookId, user.id)
      if (result.success) {
        alert("Reservation approved successfully. Book moved to student's My Books.")
        loadReservations()
      } else {
        alert(result.message || "Failed to approve reservation")
      }
    } catch (error) {
      console.error("[v0] Error approving reservation:", error)
      alert("Failed to approve reservation")
    } finally {
      setProcessingKey(null)
    }
  }

  const handleRejectReservation = async (userId: number, bookId: number) => {
    if (!user) return

    const reason = prompt("Enter rejection reason (optional):")
    if (reason === null) return

    const key = `${userId}-${bookId}`
    setProcessingKey(key)
    try {
      const result = await apiService.rejectReservation(userId, bookId, user.id, reason || "Rejected by librarian")
      if (result.success) {
        alert("Reservation rejected. It will be offered to the next user in queue.")
        loadReservations()
      } else {
        alert(result.message || "Failed to reject reservation")
      }
    } catch (error) {
      console.error("[v0] Error rejecting reservation:", error)
      alert("Failed to reject reservation")
    } finally {
      setProcessingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservation Approvals</h1>
        <p className="text-muted-foreground">Review and approve fulfilled reservation requests</p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
            <p className="text-muted-foreground text-center">
              There are currently no fulfilled reservations awaiting approval
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation, index) => {
            const key = `${reservation.user_id}-${reservation.book_id}`
            const isProcessing = processingKey === key
            const queueNumber = index + 1

            return (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{reservation.book_title}</CardTitle>
                      <CardDescription>by {reservation.book_author}</CardDescription>
                    </div>
                    {reservation.book_cover && (
                      <img
                        src={reservation.book_cover || "/placeholder.svg"}
                        alt={reservation.book_title}
                        className="w-16 h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Queue #</p>
                        <p className="font-bold text-lg text-primary">#{queueNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reserved On</p>
                        <p className="font-medium">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reservation.reservation_date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Since</p>
                        <p className="font-medium">{new Date(reservation.fulfilled_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Student</p>
                        <p className="font-medium">{reservation.user_name}</p>
                        <p className="text-sm text-muted-foreground">{reservation.student_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm break-all">{reservation.user_email}</p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="mb-4">
                      Pending Your Approval
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleApproveReservation(reservation.user_id, reservation.book_id)}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isProcessing ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                      onClick={() => handleRejectReservation(reservation.user_id, reservation.book_id)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4" />
                      {isProcessing ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <ReservationApprovalPage />
      </AdminLayout>
    </AuthGuard>
  )
}
