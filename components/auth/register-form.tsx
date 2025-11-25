"use client"

import type React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { apiService } from "@/lib/api-service"
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle,
  School,
  MapPin,
  Award as IdCard,
  Calendar,
  Phone,
  Info,
} from "lucide-react"

interface RegisterFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
}

export function RegisterForm({ onSuccess, onToggleMode }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [libraryId, setLibraryId] = useState("")
  const [address, setAddress] = useState("")
  const [school, setSchool] = useState("")
  const [role, setRole] = useState("")
  const [professionalCategory, setProfessionalCategory] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()

  useEffect(() => {
    const fetchNextLibraryId = async () => {
      try {
        const response = await apiService.getNextStudentId();
        // assuming the PHP returns { success: true, next_student_id: "S0005" }
        setLibraryId(response.next_student_id || "");
      } catch (error) {
        console.error("Error fetching next student ID:", error);
      }
    };

    fetchNextLibraryId(); // ✅ call it here
  }, []); // ✅ run only once when component mounts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!role) {
      setError("Please select your role")
      return
    }

    if (role === "Student" && !school) {
      setError("Please enter your school/institution")
      return
    }

    if (role === "Professional" && !professionalCategory) {
      setError("Please specify your professional category")
      return
    }

    if (!age || Number.parseInt(age) < 1 || Number.parseInt(age) > 120) {
      setError("Please enter a valid age")
      return
    }

    if (!sex) {
      setError("Please select your sex")
      return
    }

    if (!birthDate) {
      setError("Please enter your birth date")
      return
    }

    setLoading(true)

    try {
      await register(email, password, name, {
        studentId: libraryId,
        address,
        school: role === "Student" ? school : undefined,
        educationLevel: role.toLowerCase(),
        professionalCategory: role === "Professional" ? professionalCategory : null,
        phoneNumber: phoneNumber || undefined,
        age: Number.parseInt(age),
        sex,
        birthDate,
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err: any) {
      console.error("[v0] Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Manila Sacramento Friendship Library</h1>
              <p className="text-xs text-muted-foreground">Modern Library Management</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Registration Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Your account is pending librarian approval. You'll receive a notification once approved.
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const RequiredLabel = ({
    htmlFor,
    children,
    tooltip,
  }: { htmlFor: string; children: React.ReactNode; tooltip: string }) => (
    <Label htmlFor={htmlFor} className="text-sm font-medium flex items-center gap-1">
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-destructive cursor-help inline-flex items-center">
            *
            <Info className="h-3 w-3 ml-0.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </Label>
  )

  return (
    <TooltipProvider>
      <div className="w-full max-w-6xl mx-auto px-4">

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Join our library system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-0 bg-destructive/10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-2">
                  <RequiredLabel
                    htmlFor="libraryId"
                    tooltip="Your unique library identification number, automatically generated and incremented"
                  >
                    Library ID
                  </RequiredLabel>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="libraryId"
                      type="text"
                      value={libraryId}
                      readOnly
                      className="pl-10 h-11 border-0 bg-muted/30 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="role" tooltip="Select your primary role as a library member">
                    Role
                  </RequiredLabel>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-11 border-0 bg-muted/50">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Public Borrower">Public Borrower</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <RequiredLabel
                    htmlFor="name"
                    tooltip="Enter your complete legal name as it appears on official documents"
                  >
                    Full Name
                  </RequiredLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel
                    htmlFor="email"
                    tooltip="Your email address for account verification and notifications"
                  >
                    Email Address
                  </RequiredLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="age" tooltip="Your current age in years">
                    Age
                  </RequiredLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter your age"
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="sex" tooltip="Select your biological sex">
                    Sex
                  </RequiredLabel>
                  <Select value={sex} onValueChange={setSex} required>
                    <SelectTrigger className="h-11 border-0 bg-muted/50">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="birthDate" tooltip="Your date of birth for age verification">
                    Birth Date
                  </RequiredLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <RequiredLabel
                    htmlFor="address"
                    tooltip="Your complete residential address for library card delivery"
                  >
                    Address
                  </RequiredLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      className="pl-10 min-h-[80px] border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                {role === "Student" && (
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="school" tooltip="Name of your school or educational institution">
                      School/Institution
                    </RequiredLabel>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="school"
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Enter your school name"
                        className="pl-10 h-11 border-0 bg-muted/50"
                        required
                      />
                    </div>
                  </div>
                )}

                {role === "Professional" && (
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="professionalCategory" tooltip="Your professional field or occupation">
                      Professional Category
                    </RequiredLabel>
                    <Input
                      id="professionalCategory"
                      type="text"
                      value={professionalCategory}
                      onChange={(e) => setProfessionalCategory(e.target.value)}
                      placeholder="e.g., Teacher, Engineer, Doctor"
                      className="h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-1">
                    Phone Number
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Optional contact number for library notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number (optional)"
                      className="pl-10 h-11 border-0 bg-muted/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="password" tooltip="Create a secure password with at least 6 characters">
                    Password
                  </RequiredLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="confirmPassword" tooltip="Re-enter your password to confirm">
                    Confirm Password
                  </RequiredLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 h-11 border-0 bg-muted/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={onToggleMode} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
