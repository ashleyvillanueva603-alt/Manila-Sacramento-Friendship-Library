"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { CameraCapture } from "@/components/camera/camera-capture"
import { Camera, CreditCard, Search, User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: number
  name: string
  email: string
  role: string
  student_id?: string
  library_card_number?: string
  profile_picture?: string
  phone_number?: string
  address?: string
  created_at: string
  fine_amount?: number
}

function LibraryCardsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchQuery])

  const loadStudents = async () => {
    try {
      console.log("[v0] Loading students from API...")
      const response = await apiService.getUsers()

      console.log("[v0] Users response:", response)

      if (response.success && response.records) {
        // Filter for students only
        const studentUsers = response.records
          .filter((user: any) => user.role === "student")
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            student_id: user.student_id || user.studentId,
            library_card_number: user.library_card_number || user.libraryCardNumber,
            profile_picture: user.profile_picture || user.profilePicture,
            phone_number: user.phone_number || user.phoneNumber,
            address: user.address,
            created_at: user.created_at || user.createdAt,
            fine_amount: user.fine_amount || user.fineAmount || 0,
          }))

        setStudents(studentUsers)
        console.log("[v0] Loaded students:", studentUsers.length)
      } else {
        console.log("[v0] No students found or API unavailable")
        setStudents([])
      }
    } catch (error) {
      console.error("[v0] Error loading students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students)
      return
    }

    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.library_card_number?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }

  const handlePhotoCapture = async (photoDataUrl: string) => {
    if (!selectedStudent) return

    try {
      console.log("[v0] Updating student photo via API...")

      const response = await apiService.updateUser(selectedStudent.id, {
        profile_picture: photoDataUrl,
      })

      if (response.success) {
        // Update local state
        setStudents((prev) =>
          prev.map((student) =>
            student.id === selectedStudent.id ? { ...student, profile_picture: photoDataUrl } : student,
          ),
        )

        setShowCamera(false)
        setSelectedStudent(null)

        toast({
          title: "Photo Updated",
          description: "Library card photo has been successfully updated.",
        })
      } else {
        throw new Error(response.message || "Failed to update photo")
      }
    } catch (error) {
      console.error("[v0] Error updating photo:", error)
      toast({
        title: "Error",
        description: "Failed to update photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generateLibraryCard = (student: Student) => {
    // Create a printable library card
    const cardWindow = window.open("", "_blank")
    if (!cardWindow) return

    // Generate card number based on user ID if not already set
    const cardNumber = student.library_card_number || `LIB${String(student.id).padStart(6, "0")}`

    const cardHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Library Card - ${student.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
            }
            .card {
              width: 3.375in;
              height: 2.125in;
              background: linear-gradient(135deg, #0891b2 0%, #a16207 100%);
              border-radius: 8px;
              padding: 16px;
              color: white;
              position: relative;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              margin: 0 auto;
            }
            .header {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .photo {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid white;
              position: absolute;
              top: 16px;
              right: 16px;
            }
            .name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .details {
              font-size: 10px;
              line-height: 1.3;
            }
            .card-number {
              position: absolute;
              bottom: 16px;
              right: 16px;
              font-size: 12px;
              font-weight: bold;
            }
            @media print {
              body { background: white; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">CITY LIBRARY</div>
            ${student.profile_picture ? `<img src="${student.profile_picture}" alt="Photo" class="photo">` : ""}
            <div class="name">${student.name}</div>
            <div class="details">
              Student ID: ${student.student_id || "N/A"}<br>
              Email: ${student.email}<br>
              Issued: ${new Date().toLocaleDateString()}
            </div>
            <div class="card-number">${cardNumber}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `

    cardWindow.document.write(cardHtml)
    cardWindow.document.close()
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
        <h1 className="text-3xl font-bold mb-2">Library Card Management</h1>
        <p className="text-muted-foreground">Manage student library cards and photos</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {student.profile_picture ? (
                    <img
                      src={student.profile_picture || "/placeholder.svg"}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <User className="h-3 w-3" />
                      {student.student_id || "No student ID"}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <CreditCard className="h-3 w-3" />
                      {student.library_card_number || `LIB${String(student.id).padStart(6, "0")}`}
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{student.email}</span>
                </div>
                {student.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{student.phone_number}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{student.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>Joined {new Date(student.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(student)
                    setShowCamera(true)
                  }}
                  className="flex-1"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  {student.profile_picture ? "Update Photo" : "Add Photo"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateLibraryCard(student)}
                  disabled={!student.profile_picture}
                >
                  <CreditCard className="h-3 w-3 mr-1" />
                  Print Card
                </Button>
              </div>

              {student.fine_amount && student.fine_amount > 0 && (
                <Alert className="mt-3">
                  <AlertDescription className="text-xs">
                    Outstanding fine: ${student.fine_amount.toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No students found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search criteria." : "No students are registered yet."}
          </p>
        </div>
      )}

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Take Library Card Photo - {selectedStudent?.name}</DialogTitle>
            <DialogDescription>Take a clear photo for the student's library card</DialogDescription>
          </DialogHeader>
          <CameraCapture
            onPhotoCapture={handlePhotoCapture}
            onCancel={() => {
              setShowCamera(false)
              setSelectedStudent(null)
            }}
            title="Library Card Photo"
            description="Position the student in the center of the frame for their library card photo"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireLibrarian>
      <LibraryCardsPage />
    </AuthGuard>
  )
}
