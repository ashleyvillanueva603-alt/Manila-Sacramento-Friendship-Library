"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { XCircle, Search, ArrowLeft } from "lucide-react"
import { apiService } from "@/lib/api-service"
import Link from "next/link"

interface RejectedUser {
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
  rejection_reason: string
  created_at: string
}

export default function RejectedUsersPage() {
  const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<RejectedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadRejectedUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(rejectedUsers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = rejectedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.student_id.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, rejectedUsers])

  const loadRejectedUsers = async () => {
    try {
      const response = await apiService.getRejectedUsers()
      const users = response.records || []
      setRejectedUsers(users)
      setFilteredUsers(users)
    } catch (error) {
      console.error("Failed to load rejected users:", error)
    } finally {
      setLoading(false)
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
      <div className="flex items-center gap-4">
        <Link href="/admin/user-approvals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Rejected Users</h1>
          <p className="text-muted-foreground">View all rejected user registrations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rejected Registrations</CardTitle>
          <CardDescription>
            Total: {filteredUsers.length} rejected {filteredUsers.length === 1 ? "user" : "users"}
          </CardDescription>
          <div className="pt-4">
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
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No rejected users found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "No user registrations have been rejected"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium">{userData.name}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>{getRoleLabel(userData.role)}</TableCell>
                      <TableCell>{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                          <span className="mr-1">🔴</span> Rejected
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate" title={userData.rejection_reason}>
                          {userData.rejection_reason || "No reason provided"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
