"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FinesManagement } from "@/components/admin/fines-management"

function AdminFinesPage() {
  return <FinesManagement />
}

export default function Page() {
  return (
    <AuthGuard requireLibrarian>
      <AdminLayout>
        <AdminFinesPage />
      </AdminLayout>
    </AuthGuard>
  )
}
