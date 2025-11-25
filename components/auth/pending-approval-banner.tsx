"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle } from "lucide-react"

export function PendingApprovalBanner() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Account Pending Approval</p>
            <p className="text-sm mt-1">
              Your account is awaiting approval from the librarian. You can browse the catalog, but borrowing privileges
              will be enabled once your account is approved.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
