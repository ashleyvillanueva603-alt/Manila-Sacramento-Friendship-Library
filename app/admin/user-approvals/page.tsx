"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useAuth } from "@/hooks/use-auth"

interface User {
  id: number
  name: string
  email: string
  role: string
  student_id: string
  phone_number: string
  address: string
  education_level: string
  school: string
  professional_category: string
  approval_status: string
  created_at: string
}

export default function UserApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [approvedUserIds, setApprovedUserIds] = useState<Set<number>>(new Set())
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(pendingUsers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = pendingUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.student_id.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, pendingUsers])

  const loadUsers = async () => {
    try {
      const response = await apiService.request("/users/pending.php", { method: "GET" })
      const allUsers = response.records || []
      setPendingUsers(allUsers)
      setFilteredUsers(allUsers)
      setSelectedUserIds(new Set())
    } catch (error) {
      console.error("[v0] Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUserIds)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUserIds(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  const handleApprove = async (userId: number) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      await apiService.request("/users/approve.php", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          librarian_id: user?.id,
          action: "approve",
        }),
      })

      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      setApprovedUserIds((prev) => new Set(prev).add(userId))
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    } catch (error) {
      console.error("[v0] Failed to approve user:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkApprove = async () => {
    if (isProcessing || selectedUserIds.size === 0) return

    try {
      setIsProcessing(true)
      const userIdsArray = Array.from(selectedUserIds)

      await apiService.bulkApproveUsers(userIdsArray, user?.id || 0)

      setPendingUsers((prev) => prev.filter((u) => !selectedUserIds.has(u.id)))
      setApprovedUserIds((prev) => {
        const newSet = new Set(prev)
        userIdsArray.forEach((id) => newSet.add(id))
        return newSet
      })
      setSelectedUserIds(new Set())
    } catch (error) {
      console.error("[v0] Failed to bulk approve users:", error)
      await loadUsers()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedUser || isProcessing) return

    try {
      setIsProcessing(true)
      await apiService.request("/users/approve.php", {
        method: "POST",
        body: JSON.stringify({
          user_id: selectedUser.id,
          librarian_id: user?.id,
          action: "reject",
          reason: rejectionReason,
        }),
      })

      setShowRejectDialog(false)
      setRejectionReason("")

      setPendingUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(selectedUser.id)
        return newSet
      })
      setSelectedUser(null)
    } catch (error) {
      console.error("[v0] Failed to reject user:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Approvals</h1>
          <p className="text-muted-foreground">Review and approve new user registrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{filteredUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved This Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedUserIds.size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, student ID, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
                  onCheckedChange={toggleSelectAll}
                  disabled={isProcessing || filteredUsers.length === 0}
                />
                <Label htmlFor="select-all" className="cursor-pointer text-sm">
                  Select All ({selectedUserIds.size})
                </Label>
              </div>
              <Button onClick={handleBulkApprove} disabled={selectedUserIds.size === 0 || isProcessing} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected ({selectedUserIds.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No pending users</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "All user registrations have been processed"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(userData.id)}
                          onCheckedChange={() => toggleUserSelection(userData.id)}
                          disabled={isProcessing}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{userData.name}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>{getRoleLabel(userData.role)}</TableCell>
                      <TableCell>{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleApprove(userData.id)} disabled={isProcessing}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(userData)
                              setShowRejectDialog(true)
                            }}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.name}'s registration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || isProcessing}>
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
