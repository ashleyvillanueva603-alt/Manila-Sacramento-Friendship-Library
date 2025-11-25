"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function BorrowerInsightsChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Fetch borrower insights data from API
    // Mock data for demonstration
    setData([
      { pattern: "Frequent Readers", count: 45, avgBorrows: 25, percentage: 18 },
      { pattern: "Moderate Readers", count: 120, avgBorrows: 12, percentage: 49 },
      { pattern: "Occasional Readers", count: 80, avgBorrows: 5, percentage: 33 },
    ])
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrower Reading Patterns</CardTitle>
        <CardDescription>User segmentation based on borrowing behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartContainer
            config={{
              count: {
                label: "Number of Users",
                color: "hsl(var(--chart-1))",
              },
              avgBorrows: {
                label: "Avg. Borrows",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pattern" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="count" fill="var(--color-count)" name="Number of Users" />
                <Bar dataKey="avgBorrows" fill="var(--color-avgBorrows)" name="Avg. Borrows" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Reading Pattern Distribution</h4>
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.pattern}</span>
                  <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.count} users • Avg. {item.avgBorrows} borrows per user
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
