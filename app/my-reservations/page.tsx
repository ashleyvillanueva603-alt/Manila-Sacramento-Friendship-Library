"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { BorrowerLayout } from "@/components/borrower/borrower-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { apiService } from "@/lib/api-service"
import { BookOpen, Calendar, Clock, AlertCircle } from "lucide-react"

interface Reservation {
  id: number
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  reserved_date: string
  status: string
  accession_number?: string
  user_id: number
}

interface FulfilledReservation {
  id: number
  book_id: number
  book_title: string
  book_author: string
  book_cover: string
  fulfilled_at: string
  reservation_date: string
  user_id: number
}

function MyReservationsPage() {
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([])
  const [fulfilledReservations, setFulfilledReservations] = useState<FulfilledReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const { user } = useAuth()

  const loadReservations = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log("[v0] Loading reservations for user:", user.id)

      const [activeResponse, fulfilledResponse] = await Promise.all([
        apiService.getReservations(user.id, "active"),
        apiService.getFullfilledReservations(user.id),
      ])

      console.log("[v0] Active reservations response:", activeResponse)
      console.log("[v0] Fulfilled reservations response:", fulfilledResponse)

      if (activeResponse.success && activeResponse.records) {
        setActiveReservations(activeResponse.records)
      } else {
        setActiveReservations([])
      }

      if (fulfilledResponse.success && fulfilledResponse.records) {
        setFulfilledReservations(fulfilledResponse.records)
      } else {
        setFulfilledReservations([])
      }
    } catch (error) {
      console.error("[v0] Error loading reservations:", error)
      setActiveReservations([])
      setFulfilledReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [user])

  const handleCancelReservation = async (userId: number, bookId: number, bookTitle: string) => {
    if (!confirm(`Are you sure you want to cancel the reservation for "${bookTitle}"?`)) return

    setCancellingId(bookId)
    try {
      console.log("[v0] Cancelling reservation for user:", userId, "book:", bookId)
      const result = await apiService.cancelReservation(userId, bookId)
      console.log("[v0] Cancel result:", result)
      if (result.success) {
        alert("Reservation cancelled successfully")
        loadReservations()
      } else {
        alert(result.message || "Failed to cancel reservation")
      }
    } catch (error) {
      console.error("[v0] Error cancelling reservation:", error)
      alert("Failed to cancel reservation: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalReservations = activeReservations.length + fulfilledReservations.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reservations</h1>
        <p className="text-muted-foreground">Track your reserved books and approved requests</p>
      </div>

      {totalReservations === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reservations found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't reserved any books yet. Reserve a book when it's unavailable to get notified when it becomes
              available.
            </p>
            <Button asChild>
              <a href="/books">Browse Books</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {fulfilledReservations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Ready for Pickup</h2>
                <Badge variant="secondary">{fulfilledReservations.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fulfilledReservations.map((reservation) => (
                  <Card
                    key={reservation.id}
                    className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900"
                  >
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
                      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-700 dark:text-amber-300">
                            Available - Awaiting Librarian Approval
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Available since: {new Date(reservation.fulfilled_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Your reservation has been fulfilled! The librarian will review and approve your request shortly.
                        Once approved, the book will be available in your My Books section.
                      </p>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() =>
                          handleCancelReservation(reservation.user_id, reservation.book_id, reservation.book_title)
                        }
                        disabled={cancellingId === reservation.book_id}
                      >
                        {cancellingId === reservation.book_id ? "Cancelling..." : "Cancel Reservation"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeReservations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Waiting for Availability</h2>
                <Badge variant="default">{activeReservations.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeReservations.map((reservation) => (
                  <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
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
                      <div className="flex items-center gap-2">
                        <Badge variant={reservation.status === "active" ? "default" : "secondary"}>
                          {reservation.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Reserved: {new Date(reservation.reserved_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>Accession: {reservation.accession_number || "Copy pending / not assigned"}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleCancelReservation(user!.id, reservation.book_id, reservation.book_title)}
                        disabled={cancellingId === reservation.book_id}
                      >
                        {cancellingId === reservation.book_id ? "Cancelling..." : "Cancel Reservation"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <BorrowerLayout>
        <MyReservationsPage />
      </BorrowerLayout>
    </AuthGuard>
  )
}
