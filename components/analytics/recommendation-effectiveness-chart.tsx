"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function RecommendationEffectivenessChart() {
  const [data, setData] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalRecommendations: 0,
    viewRate: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    // Fetch recommendation effectiveness data from API
    // Mock data for demonstration
    const mockData = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const total = Math.floor(Math.random() * 50) + 30
      const viewed = Math.floor(total * (Math.random() * 0.3 + 0.5))
      const borrowed = Math.floor(viewed * (Math.random() * 0.2 + 0.1))

      mockData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total,
        viewed,
        borrowed,
        viewRate: ((viewed / total) * 100).toFixed(1),
        conversionRate: ((borrowed / total) * 100).toFixed(1),
      })
    }

    setData(mockData)

    // Calculate summary
    const totalRecs = mockData.reduce((sum, d) => sum + d.total, 0)
    const totalViewed = mockData.reduce((sum, d) => sum + d.viewed, 0)
    const totalBorrowed = mockData.reduce((sum, d) => sum + d.borrowed, 0)

    setSummary({
      totalRecommendations: totalRecs,
      viewRate: (totalViewed / totalRecs) * 100,
      conversionRate: (totalBorrowed / totalRecs) * 100,
    })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation System Effectiveness</CardTitle>
        <CardDescription>Tracking how users interact with personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Recommendations</p>
            <p className="text-2xl font-bold">{summary.totalRecommendations}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">View Rate</p>
            <p className="text-2xl font-bold">{summary.viewRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold">{summary.conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer
          config={{
            total: {
              label: "Total Recommendations",
              color: "hsl(var(--chart-1))",
            },
            viewed: {
              label: "Viewed",
              color: "hsl(var(--chart-2))",
            },
            borrowed: {
              label: "Borrowed",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="var(--color-total)" name="Total Recommendations" />
              <Line type="monotone" dataKey="viewed" stroke="var(--color-viewed)" name="Viewed" />
              <Line type="monotone" dataKey="borrowed" stroke="var(--color-borrowed)" name="Borrowed" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
