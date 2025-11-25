"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User } from "@/lib/database"
import { Search, UserCheck, UserX, Users, AlertCircle } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { db } from "@/lib/database"

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [apiUnavailable, setApiUnavailable] = useState(false)

  const loadUsers = async () => {
    try {
      console.log("[v0] Loading users from API...")
      const response = await apiService.getUsers()
      console.log("[v0] API response:", response)

      const allUsers = response.success ? response.records : []
      console.log("[v0] Loaded users count:", allUsers.length)

      const approvedUsers = allUsers.filter((user: any) => {
        if (user.role === "librarian" || user.role === "admin") {
          return true // Show all librarians/admins
        }
        // For students, only show approved ones
        return (
          user.isActive === true ||
          user.isActive === 1 ||
          user.isActive === "1" ||
          user.approved === true ||
          user.approved === 1 ||
          user.approved === "1"
        )
      })

      console.log("[v0] Approved users count:", approvedUsers.length)

      setUsers(approvedUsers)
      setFilteredUsers(approvedUsers)
      setApiUnavailable(false)
    } catch (error) {
      console.error("[v0] Error loading users from API:", error)
      console.log("[v0] Falling back to IndexedDB...")
      try {
        const localUsers = await db.users.toArray()
        console.log("[v0] Loaded users from IndexedDB:", localUsers.length)

        const approvedUsers = localUsers.filter((user) => {
          if (user.role === "librarian" || user.role === "admin") {
            return true
          }
          return user.isActive === true || user.approved === true
        })

        setUsers(approvedUsers)
        setFilteredUsers(approvedUsers)
        setApiUnavailable(true)
      } catch (dbError) {
        console.error("[v0] Error loading users from IndexedDB:", dbError)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      if (!apiUnavailable) {
        console.log("[v0] Updating user status via API:", userId)
        await apiService.updateUser(userId, {
          isActive: !currentStatus,
        })
      } else {
        console.log("[v0] Updating user status via IndexedDB:", userId)
        await db.users.update(userId, { isActive: !currentStatus })
      }
      loadUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
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
      {apiUnavailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Unavailable</AlertTitle>
          <AlertDescription>
            The users API endpoint is not available. Using local data instead. To enable API functionality, upload the
            following files to your Hostinger server:
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>
                <code>api/users/read.php</code>
              </li>
              <li>
                <code>api/users/update.php</code>
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage library members and staff</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms" : "No users registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id!, user.isActive)}
                    className="flex-1"
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
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
        <AdminUsersPage />
      </AdminLayout>
    </AuthGuard>
  )
}
