"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { BorrowingManagement } from "@/components/admin/borrowing-management"

function AdminBorrowingPage() {
  return <BorrowingManagement />
}

export default function Page() {
  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <AdminBorrowingPage />
      </AdminLayout>
    </AuthGuard>
  )
}
