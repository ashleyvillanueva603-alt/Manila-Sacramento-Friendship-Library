"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import MigrationService from "@/lib/migration-service"

interface MigrationProgress {
  step: string
  current: number
  total: number
  completed: boolean
  error?: string
}

export function MigrationPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<MigrationProgress | null>(null)
  const [validationReport, setValidationReport] = useState<string>("")

  const handleMigration = async () => {
    setIsRunning(true)
    setProgress(null)
    setValidationReport("")

    const migrationService = new MigrationService((progress) => {
      setProgress(progress)
    })

    const success = await migrationService.migrateData()

    if (success) {
      const validation = await migrationService.validateMigration()
      setValidationReport(validation.report)
    }

    setIsRunning(false)
  }

  const handleClearIndexedDB = async () => {
    if (confirm("Are you sure you want to clear all IndexedDB data? This action cannot be undone.")) {
      const migrationService = new MigrationService()
      const success = await migrationService.clearIndexedDB()

      if (success) {
        alert("IndexedDB cleared successfully")
      } else {
        alert("Failed to clear IndexedDB")
      }
    }
  }

  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
          <CardDescription>
            Migrate data from IndexedDB to MySQL database. This process will transfer users, books, and other records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progress.step}</span>
                <Badge variant={progress.completed ? "default" : progress.error ? "destructive" : "secondary"}>
                  {progress.completed ? "Completed" : progress.error ? "Error" : "In Progress"}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Step {progress.current} of {progress.total}
              </p>
              {progress.error && (
                <Alert variant="destructive">
                  <AlertDescription>{progress.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleMigration} disabled={isRunning}>
              {isRunning ? "Migrating..." : "Start Migration"}
            </Button>
            <Button variant="outline" onClick={handleClearIndexedDB} disabled={isRunning}>
              Clear IndexedDB
            </Button>
          </div>

          {validationReport && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Migration Report</h4>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap">
                {validationReport}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Before Migration:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Ensure MySQL database is set up and accessible</li>
              <li>Verify PHP API endpoints are working</li>
              <li>Backup existing IndexedDB data if needed</li>
              <li>Set the correct API_BASE_URL in environment variables</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Migration Process:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Users and books will be migrated automatically</li>
              <li>Relational data (borrow records, requests) requires manual handling</li>
              <li>Foreign key relationships need to be mapped to new MySQL IDs</li>
              <li>Password hashing may need to be updated for security</li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Important:</strong> This migration tool handles basic data transfer. Complex relational data with
              foreign key constraints requires additional manual steps to ensure data integrity.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
