"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookUsageChart } from "./book-usage-chart"
import { CategoryPerformanceChart } from "./category-performance-chart"
import { BorrowerInsightsChart } from "./borrower-insights-chart"
import { TimeSeriesChart } from "./time-series-chart"
import { RecommendationEffectivenessChart } from "./recommendation-effectiveness-chart"
import { OverallStatsCards } from "./overall-stats-cards"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const handleExportReport = () => {
    // Export functionality
    console.log("Exporting report...")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights combining descriptive and prescriptive analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleString()}</p>

      {/* Overall Statistics Cards */}
      <OverallStatsCards />

      {/* Tabbed Analytics Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Book Analytics</TabsTrigger>
          <TabsTrigger value="users">User Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TimeSeriesChart />
            <CategoryPerformanceChart />
          </div>
          <BookUsageChart limit={10} />
        </TabsContent>

        {/* Book Analytics Tab */}
        <TabsContent value="books" className="space-y-4">
          <BookUsageChart limit={20} />
          <CategoryPerformanceChart detailed />
        </TabsContent>

        {/* User Insights Tab */}
        <TabsContent value="users" className="space-y-4">
          <BorrowerInsightsChart />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationEffectivenessChart />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <TimeSeriesChart extended />
        </TabsContent>
      </Tabs>
    </div>
  )
}
