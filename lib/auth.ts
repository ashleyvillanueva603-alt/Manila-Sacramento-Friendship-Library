import { apiService } from "./api-service"

export interface AuthUser {
  id: number
  email: string
  name: string
  role: "librarian" | "student" | "admin"
  studentId?: string
  libraryCardNumber?: string
  profilePicture?: string
  approved?: boolean
}

class AuthService {
  private currentUser: AuthUser | null = null

  async login(email: string, password: string): Promise<AuthUser | null> {
    try {
      const response = await apiService.login(email, password)
      console.log("[v0] Login response:", response)

      if (response.success && response.user) {
        const isApproved =
          response.user.role === "librarian" ||
          response.user.role === "admin" ||
          response.user.approved === true ||
          response.user.approved === 1 ||
          response.user.approved === "1" ||
          response.user.approval_status === "approved"

        console.log("[v0] User approval status:", isApproved, "Role:", response.user.role)
        console.log("[v0] Raw approval fields from API:", {
          approved: response.user.approved,
          approval_status: response.user.approval_status,
        })

        this.currentUser = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          studentId: response.user.student_id,
          libraryCardNumber: response.user.library_card_number,
          profilePicture: response.user.profile_picture,
          approved: isApproved,
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
        }

        console.log("[v0] Final user object stored:", this.currentUser)

        return this.currentUser
      }

      return null
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        throw error
      }
      return null
    }
  }

  async register(
    email: string,
    password: string,
    name: string,
    additionalInfo?: {
      studentId?: string
      address?: string
      school?: string
      educationLevel?: string
      professionalCategory?: string | null
      phoneNumber?: string
      age?: number
      sex?: string
      birthDate?: string
    },
  ): Promise<AuthUser | null> {
    try {
      const registrationData = {
        email,
        password,
        name,
        role: "student",
        student_id: additionalInfo?.studentId,
        address: additionalInfo?.address,
        school: additionalInfo?.school,
        education_level: additionalInfo?.educationLevel,
        professional_category: additionalInfo?.professionalCategory,
        phone_number: additionalInfo?.phoneNumber,
        age: additionalInfo?.age,
        sex: additionalInfo?.sex,
        birth_date: additionalInfo?.birthDate,
        approved: false,
        is_active: true,
      }

      console.log("[v0] Registration data being sent:", registrationData)

      const response = await apiService.register(registrationData)

      console.log("[v0] Registration response:", response)

      if (response.success || response.message?.includes("successfully")) {
        return null // Return null to indicate successful registration (user needs approval)
      }

      throw new Error(response.message || "Registration failed")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  logout(): void {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      console.log("[v0] Returning cached user:", this.currentUser)
      return this.currentUser
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          console.log("[v0] Loaded user from localStorage:", this.currentUser)
          return this.currentUser
        } catch {
          localStorage.removeItem("currentUser")
        }
      }
    }

    console.log("[v0] No user found in cache or localStorage")
    return null
  }

  async refreshUserData(): Promise<AuthUser | null> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      return null
    }

    try {
      console.log("[v0] Refreshing user data for user ID:", currentUser.id)
      const response = await apiService.getCurrentUserData(currentUser.id)

      if (response && response.user) {
        const userData = response.user

        const isApproved =
          userData.role === "librarian" ||
          userData.role === "admin" ||
          userData.approved === true ||
          userData.approved === 1 ||
          userData.approved === "1" ||
          userData.approval_status === "approved"

        console.log("[v0] Refreshed approval status:", isApproved)
        console.log("[v0] Raw approval fields from refresh:", {
          approved: userData.approved,
          approval_status: userData.approval_status,
        })

        this.currentUser = {
          ...currentUser,
          approved: isApproved,
          name: userData.name || currentUser.name,
          email: userData.email || currentUser.email,
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
        }

        console.log("[v0] Updated user object after refresh:", this.currentUser)
        return this.currentUser
      }

      return currentUser
    } catch (error) {
      console.error("[v0] Error refreshing user data:", error)
      return currentUser
    }
  }

  isLibrarian(): boolean {
    if (typeof window === "undefined") {
      return false
    }
    return this.getCurrentUser()?.role === "librarian"
  }

  isStudent(): boolean {
    if (typeof window === "undefined") {
      return false
    }
    return this.getCurrentUser()?.role === "student"
  }

  isAdmin(): boolean {
    if (typeof window === "undefined") {
      return false
    }
    return this.getCurrentUser()?.role === "admin"
  }

  isBorrower(): boolean {
    return this.isStudent()
  }
}

export const authService = new AuthService()
