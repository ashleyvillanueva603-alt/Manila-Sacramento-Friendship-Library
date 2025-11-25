"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { db } from "@/lib/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FineWithDetails {
  id: number
  user_id: number
  user_name: string
  user_email: string
  borrow_record_id: number
  book_title: string
  book_author: string
  amount: number
  reason: string
  status: "pending" | "paid" | "waived"
  created_date: string
  paid_date: string | null
  payment_method: string | null
}

export function FinesManagement() {
  const [pendingFines, setPendingFines] = useState<FineWithDetails[]>([])
  const [paidFines, setPaidFines] = useState<FineWithDetails[]>([])
  const [waivedFines, setWaivedFines] = useState<FineWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [processingFineId, setProcessingFineId] = useState<number | null>(null)

  const loadFinesData = async () => {
    try {
      setLoading(true)

      // Get all fines with related user and borrow record data
      const allFines = await db.fines.toArray()

      // Enrich fines with user and book details
      const enrichedFines = await Promise.all(
        allFines.map(async (fine) => {
          const user = await db.users.get(fine.user_id)
          const borrowRecord = await db.borrowRecords.get(fine.borrow_record_id)
          const book = borrowRecord ? await db.books.get(borrowRecord.book_id) : null

          return {
            id: fine.id!,
            user_id: fine.user_id,
            user_name: user?.name || "Unknown User",
            user_email: user?.email || "N/A",
            borrow_record_id: fine.borrow_record_id,
            book_title: book?.title || "Unknown Book",
            book_author: book?.author || "Unknown Author",
            amount: fine.amount,
            reason: fine.reason,
            status: fine.status,
            created_date: fine.created_date,
            paid_date: fine.paid_date,
            payment_method: fine.payment_method,
          } as FineWithDetails
        }),
      )

      // Filter by search term if provided
      const filtered = searchTerm
        ? enrichedFines.filter(
            (fine) =>
              fine.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              fine.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              fine.book_title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : enrichedFines

      // Separate by status
      const pending = filtered.filter((fine) => fine.status === "pending")
      const paid = filtered.filter((fine) => fine.status === "paid")
      const waived = filtered.filter((fine) => fine.status === "waived")

      setPendingFines(pending)
      setPaidFines(paid)
      setWaivedFines(waived)
    } catch (error) {
      console.error("Error loading fines data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinesData()
  }, [searchTerm])

  const handleMarkAsPaid = async (fineId: number, paymentMethod: string) => {
    try {
      setProcessingFineId(fineId)

      await db.fines.update(fineId, {
        status: "paid",
        payment_method: paymentMethod,
        paid_date: new Date().toISOString(),
      })

      alert("Fine marked as paid successfully!")
      loadFinesData()
    } catch (error) {
      console.error("Error marking fine as paid:", error)
      alert("Failed to mark fine as paid. Please try again.")
    } finally {
      setProcessingFineId(null)
    }
  }

  const handleWaiveFine = async (fineId: number) => {
    if (confirm("Are you sure you want to waive this fine?")) {
      try {
        setProcessingFineId(fineId)

        await db.fines.update(fineId, {
          status: "waived",
          paid_date: new Date().toISOString(),
        })

        alert("Fine waived successfully!")
        loadFinesData()
      } catch (error) {
        console.error("Error waiving fine:", error)
        alert("Failed to waive fine. Please try again.")
      } finally {
        setProcessingFineId(null)
      }
    }
  }

  const calculateTotalAmount = (fines: FineWithDetails[]) => {
    return fines.reduce((sum, fine) => sum + Number(fine.amount), 0).toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fines Management</h2>
          <p className="text-muted-foreground">Track and manage library fines and penalties</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name, email, or book title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fines</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalAmount(pendingFines)}</div>
            <p className="text-xs text-muted-foreground">{pendingFines.length} unpaid fines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Fines</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalAmount(paidFines)}</div>
            <p className="text-xs text-muted-foreground">{paidFines.length} paid fines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waived Fines</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalAmount(waivedFines)}</div>
            <p className="text-xs text-muted-foreground">{waivedFines.length} waived fines</p>
          </CardContent>
        </Card>
      </div>

      {/* Fines Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingFines.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidFines.length})</TabsTrigger>
          <TabsTrigger value="waived">Waived ({waivedFines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingFines.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending fines</h3>
                <p className="text-muted-foreground">All fines have been resolved</p>
              </CardContent>
            </Card>
          ) : (
            pendingFines.map((fine) => (
              <Card key={fine.id} className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{fine.user_name}</CardTitle>
                      <CardDescription>{fine.user_email}</CardDescription>
                    </div>
                    <Badge variant="destructive">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Book:</span>
                      <span className="font-medium">{fine.book_title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{fine.book_author}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{fine.reason}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(fine.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="text-2xl font-bold text-destructive">${Number(fine.amount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => handleMarkAsPaid(fine.id, value)}
                      disabled={processingFineId === fine.id}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Mark as Paid" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => handleWaiveFine(fine.id)}
                      disabled={processingFineId === fine.id}
                    >
                      {processingFineId === fine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Waive Fine"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {paidFines.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No paid fines</h3>
                <p className="text-muted-foreground">No fines have been paid yet</p>
              </CardContent>
            </Card>
          ) : (
            paidFines.map((fine) => (
              <Card key={fine.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{fine.user_name}</CardTitle>
                      <CardDescription>{fine.user_email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Paid
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Book:</span>
                      <span className="font-medium">{fine.book_title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">${Number(fine.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="capitalize">{fine.payment_method || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span>{fine.paid_date ? new Date(fine.paid_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="waived" className="space-y-4">
          {waivedFines.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No waived fines</h3>
                <p className="text-muted-foreground">No fines have been waived</p>
              </CardContent>
            </Card>
          ) : (
            waivedFines.map((fine) => (
              <Card key={fine.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{fine.user_name}</CardTitle>
                      <CardDescription>{fine.user_email}</CardDescription>
                    </div>
                    <Badge variant="outline">Waived</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Book:</span>
                      <span className="font-medium">{fine.book_title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{fine.reason}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold">${Number(fine.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Waived Date:</span>
                      <span>{fine.paid_date ? new Date(fine.paid_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
