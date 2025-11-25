"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api-service"
import { BookOpen, Calendar, User, CheckCircle } from "lucide-react"

interface Reservation {
  id: number
  user_id: number
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  user_name: string
  user_email: string
  student_id: string
  reserved_date: string
  status: string
  accession_number?: string
  available_copies: number
}

function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [markingAvailableId, setMarkingAvailableId] = useState<number | null>(null)

  const loadReservations = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading all reservations for admin...")
      const response = await apiService.getReservations(undefined, "active")
      console.log("[v0] Reservations response:", response)

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

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return

    setCancellingId(reservationId)
    try {
      const result = await apiService.cancelReservation(reservationId)
      if (result.success) {
        alert("Reservation cancelled successfully")
        loadReservations()
      } else {
        alert(result.message || "Failed to cancel reservation")
      }
    } catch (error) {
      console.error("[v0] Error cancelling reservation:", error)
      alert("Failed to cancel reservation")
    } finally {
      setCancellingId(null)
    }
  }

  const handleMarkAsAvailable = async (reservationId: number) => {
    if (!confirm("Mark this book as available for pickup? The borrower will be notified.")) return

    setMarkingAvailableId(reservationId)
    try {
      const result = await apiService.fulfillReservation(reservationId)
      if (result.success) {
        alert("Book marked as available! Borrower has been notified.")
        loadReservations()
      } else {
        alert(result.message || "Failed to mark as available")
      }
    } catch (error) {
      console.error("[v0] Error marking as available:", error)
      alert("Failed to mark as available")
    } finally {
      setMarkingAvailableId(null)
    }
  }

  // Group reservations by student
  const groupedReservations = reservations.reduce(
    (acc, reservation) => {
      const key = `${reservation.user_id}-${reservation.user_name}`
      if (!acc[key]) {
        acc[key] = {
          userId: reservation.user_id,
          userName: reservation.user_name,
          userEmail: reservation.user_email,
          studentId: reservation.student_id,
          reservations: [],
        }
      }
      acc[key].reservations.push(reservation)
      return acc
    },
    {} as Record<
      string,
      {
        userId: number
        userName: string
        userEmail: string
        studentId: string
        reservations: Reservation[]
      }
    >,
  )

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
        <h1 className="text-3xl font-bold">Book Reservations</h1>
        <p className="text-muted-foreground">Manage all pending and active book reservations</p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reservations found</h3>
            <p className="text-muted-foreground text-center">There are currently no active reservations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedReservations).map((group) => (
            <Card key={group.userId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {group.userName}
                    </CardTitle>
                    <CardDescription>
                      {group.userEmail} • Student ID: {group.studentId}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{group.reservations.length} reservations</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.reservations.map((reservation) => {
                    const isBookAvailable = (reservation.available_copies || 0) > 0

                    return (
                      <div
                        key={reservation.id}
                        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                          isBookAvailable ? "border-green-200 bg-green-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {reservation.book_cover && (
                            <img
                              src={reservation.book_cover || "/placeholder.svg"}
                              alt={reservation.book_title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{reservation.book_title}</p>
                            <p className="text-sm text-muted-foreground truncate">by {reservation.book_author}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Reserved: {new Date(reservation.reserved_date).toLocaleDateString()}
                              </div>
                              <div>Accession: {reservation.accession_number || "Copy pending / not assigned"}</div>
                            </div>
                            {isBookAvailable && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                                <CheckCircle className="h-3 w-3" />
                                {reservation.available_copies} copy{reservation.available_copies > 1 ? "ies" : ""}{" "}
                                available
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant={reservation.status === "active" ? "default" : "secondary"}>
                            {reservation.status}
                          </Badge>
                          {isBookAvailable ? (
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={() => handleMarkAsAvailable(reservation.id)}
                              disabled={markingAvailableId === reservation.id}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {markingAvailableId === reservation.id ? "Notifying..." : "Notify Ready"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelReservation(reservation.id)}
                              disabled={cancellingId === reservation.id}
                            >
                              {cancellingId === reservation.id ? "Cancelling..." : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <AdminReservationsPage />
      </AdminLayout>
    </AuthGuard>
  )
}
