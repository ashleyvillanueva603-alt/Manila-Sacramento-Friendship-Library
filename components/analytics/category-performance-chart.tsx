"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface CategoryPerformanceChartProps {
  detailed?: boolean
}

export function CategoryPerformanceChart({ detailed = false }: CategoryPerformanceChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Fetch category performance data from API
    // Mock data for demonstration
    setData([
      { category: "Fiction", totalBorrows: 850, totalBooks: 320, trend: "increasing", percentage: 35 },
      { category: "Science", totalBorrows: 520, totalBooks: 180, trend: "stable", percentage: 21 },
      { category: "History", totalBorrows: 420, totalBooks: 150, trend: "increasing", percentage: 17 },
      { category: "Technology", totalBorrows: 380, totalBooks: 140, trend: "increasing", percentage: 16 },
      { category: "Arts", totalBorrows: 180, totalBooks: 90, trend: "decreasing", percentage: 7 },
      { category: "Other", totalBorrows: 100, totalBooks: 70, trend: "stable", percentage: 4 },
    ])
  }, [])

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--muted))",
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Book borrowing distribution by category with trend analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartContainer
            config={{
              borrows: {
                label: "Borrows",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="totalBorrows" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Category Trends</h4>
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.totalBorrows} borrows</span>
                  {getTrendIcon(item.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
